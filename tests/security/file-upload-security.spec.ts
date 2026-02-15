/**
 * File Upload Security Tests
 *
 * Tests for magic number validation, file size limits,
 * and malicious file upload prevention
 */

import { test, expect } from '@playwright/test';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// ============================================================
// Test Utilities
// ============================================================

/**
 * Create a mock file with specific magic number
 */
function createMockFileWithMagicNumber(magicNumber: string, fileName: string): File {
  // Create a buffer with the magic number
  const buffer = new TextEncoder().encode(magicNumber + ' '.repeat(1024)); // Pad to 1KB
  return new File([buffer], fileName, { type: 'application/octet-stream' });
}

/**
 * Create a mock file with misleading extension
 * (e.g., a PDF file renamed to .ai)
 */
function createMisleadingFile(content: string, extension: string): File {
  const buffer = new TextEncoder().encode(content);
  return new File([buffer], `malicious${extension}`, { type: 'application/octet-stream' });
}

// ============================================================
// Magic Number Validation Tests
// ============================================================

test.describe('Magic Number Validation', () => {
  test('should reject .ai file with PDF content', async ({ request }) => {
    const formData = new FormData();
    const file = createMisleadingFile('%PDF-1.4 fake PDF content', '.ai');
    formData.append('file', file);
    formData.append('metadata', JSON.stringify({
      file_name: file.name,
      file_type: 'ai',
    }));

    const response = await request.post(`${API_BASE_URL}/api/b2b/files/upload`, {
      data: formData,
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.code).toBe('INVALID_FILE_CONTENT');
  });

  test('should reject .pdf file with AI content', async ({ request }) => {
    const formData = new FormData();
    const file = createMisleadingFile('%AI-Adobe Illustrator file', '.pdf');
    formData.append('file', file);
    formData.append('metadata', JSON.stringify({
      file_name: file.name,
      file_type: 'pdf',
    }));

    const response = await request.post(`${API_BASE_URL}/api/b2b/files/upload`, {
      data: formData,
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.code).toBe('INVALID_FILE_CONTENT');
  });

  test('should accept valid PDF file', async ({ request }) => {
    const formData = new FormData();
    const file = createMockFileWithMagicNumber('%PDF-1.4\n%fake content', 'test.pdf');
    formData.append('file', file);
    formData.append('metadata', JSON.stringify({
      file_name: file.name,
      file_type: 'pdf',
    }));

    const response = await request.post(`${API_BASE_URL}/api/b2b/files/upload`, {
      data: formData,
    });

    // Note: This might fail due to authentication, but should NOT fail with INVALID_FILE_CONTENT
    if (response.status() === 400) {
      const data = await response.json();
      expect(data.code).not.toBe('INVALID_FILE_CONTENT');
    }
  });

  test('should accept valid AI file', async ({ request }) => {
    const formData = new FormData();
    const file = createMockFileWithMagicNumber('%AI-Adobe Illustrator', 'test.ai');
    formData.append('file', file);
    formData.append('metadata', JSON.stringify({
      file_name: file.name,
      file_type: 'ai',
    }));

    const response = await request.post(`${API_BASE_URL}/api/b2b/files/upload`, {
      data: formData,
    });

    // Note: This might fail due to authentication, but should NOT fail with INVALID_FILE_CONTENT
    if (response.status() === 400) {
      const data = await response.json();
      expect(data.code).not.toBe('INVALID_FILE_CONTENT');
    }
  });
});

// ============================================================
// File Size Limit Tests
// ============================================================

test.describe('File Size Limits (10MB)', () => {
  test('should reject file larger than 10MB', async ({ request }) => {
    const formData = new FormData();

    // Create an 11MB file
    const largeBuffer = new Uint8Array(11 * 1024 * 1024);
    const largeFile = new File([largeBuffer], 'large.pdf', { type: 'application/pdf' });

    formData.append('file', largeFile);
    formData.append('metadata', JSON.stringify({
      file_name: largeFile.name,
      file_type: 'pdf',
    }));

    const response = await request.post(`${API_BASE_URL}/api/b2b/files/upload`, {
      data: formData,
    });

    expect(response.status()).toBe(413);
    const data = await response.json();
    expect(data.code).toBe('FILE_TOO_LARGE');
  });

  test('should accept file exactly at 10MB limit', async ({ request }) => {
    const formData = new FormData();

    // Create exactly 10MB file
    const buffer = new Uint8Array(10 * 1024 * 1024);
    // Add valid PDF magic number
    const pdfHeader = new TextEncoder().encode('%PDF-1.4');
    buffer.set(pdfHeader, 0);

    const file = new File([buffer], 'exactly-10mb.pdf', { type: 'application/pdf' });

    formData.append('file', file);
    formData.append('metadata', JSON.stringify({
      file_name: file.name,
      file_type: 'pdf',
    }));

    const response = await request.post(`${API_BASE_URL}/api/b2b/files/upload`, {
      data: formData,
    });

    // Should NOT fail with FILE_TOO_LARGE
    if (response.status() === 413) {
      fail('File at exactly 10MB should be accepted');
    }
  });

  test('should accept file under 10MB', async ({ request }) => {
    const formData = new FormData();

    // Create a 5MB file
    const buffer = new Uint8Array(5 * 1024 * 1024);
    // Add valid PDF magic number
    const pdfHeader = new TextEncoder().encode('%PDF-1.4');
    buffer.set(pdfHeader, 0);

    const file = new File([buffer], 'small.pdf', { type: 'application/pdf' });

    formData.append('file', file);
    formData.append('metadata', JSON.stringify({
      file_name: file.name,
      file_type: 'pdf',
    }));

    const response = await request.post(`${API_BASE_URL}/api/b2b/files/upload`, {
      data: formData,
    });

    // Should NOT fail with FILE_TOO_LARGE
    expect(response.status()).not.toBe(413);
  });
});

// ============================================================
// Malicious File Tests
// ============================================================

test.describe('Malicious File Prevention', () => {
  test('should reject file with no magic number', async ({ request }) => {
    const formData = new FormData();

    // Create a file with random content and no valid magic number
    const buffer = new Uint8Array(1024);
    crypto.getRandomValues(buffer);

    const file = new File([buffer], 'suspicious.pdf', { type: 'application/pdf' });

    formData.append('file', file);
    formData.append('metadata', JSON.stringify({
      file_name: file.name,
      file_type: 'pdf',
    }));

    const response = await request.post(`${API_BASE_URL}/api/b2b/files/upload`, {
      data: formData,
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.code).toBe('INVALID_FILE_CONTENT');
  });

  test('should reject file with executable magic number', async ({ request }) => {
    const formData = new FormData();

    // Create a file with EXE magic number (MZ header)
    const exeHeader = new Uint8Array([0x4D, 0x5A]); // "MZ"
    const buffer = new Uint8Array(1024);
    buffer.set(exeHeader, 0);

    const file = new File([buffer], 'malware.exe.pdf', { type: 'application/pdf' });

    formData.append('file', file);
    formData.append('metadata', JSON.stringify({
      file_name: file.name,
      file_type: 'pdf',
    }));

    const response = await request.post(`${API_BASE_URL}/api/b2b/files/upload`, {
      data: formData,
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.code).toBe('INVALID_FILE_CONTENT');
  });

  test('should reject script file disguised as PDF', async ({ request }) => {
    const formData = new FormData();

    // Create a JavaScript file with PDF extension
    const scriptContent = '<script>alert("XSS")</script>';
    const buffer = new TextEncoder().encode(scriptContent);

    const file = new File([buffer], 'xss.pdf', { type: 'application/pdf' });

    formData.append('file', file);
    formData.append('metadata', JSON.stringify({
      file_name: file.name,
      file_type: 'pdf',
    }));

    const response = await request.post(`${API_BASE_URL}/api/b2b/files/upload`, {
      data: formData,
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.code).toBe('INVALID_FILE_CONTENT');
  });
});

// ============================================================
// AI Parser Upload Security Tests
// ============================================================

test.describe('AI Parser Upload Security', () => {
  test('should reject oversized file', async ({ request }) => {
    const formData = new FormData();

    // Create an 11MB file
    const largeBuffer = new Uint8Array(11 * 1024 * 1024);
    const largeFile = new File([largeBuffer], 'large.ai', { type: 'application/postscript' });

    formData.append('file', largeFile);

    const response = await request.post(`${API_BASE_URL}/api/ai-parser/upload`, {
      data: formData,
    });

    expect(response.status()).toBe(413);
  });

  test('should validate file content by magic number', async ({ request }) => {
    const formData = new FormData();

    // PDF file with .ai extension
    const file = createMisleadingFile('%PDF-1.4 fake PDF', '.ai');
    formData.append('file', file);

    const response = await request.post(`${API_BASE_URL}/api/ai-parser/upload`, {
      data: formData,
    });

    expect(response.status()).toBe(400);
  });
});

// ============================================================
// B2B AI Extraction Upload Security Tests
// ============================================================

test.describe('B2B AI Extraction Upload Security', () => {
  test('should reject file with wrong magic number', async ({ request }) => {
    const formData = new FormData();

    // PDF file with .ai extension
    const file = createMisleadingFile('%PDF-1.4', '.ai');
    formData.append('file', file);
    formData.append('order_id', 'test-order-id');

    const response = await request.post(`${API_BASE_URL}/api/b2b/ai-extraction/upload`, {
      data: formData,
    });

    expect(response.status()).toBe(400);
  });

  test('should enforce 10MB size limit', async ({ request }) => {
    const formData = new FormData();

    // Create an 11MB file
    const largeBuffer = new Uint8Array(11 * 1024 * 1024);
    const largeFile = new File([largeBuffer], 'large.ai', { type: 'application/postscript' });

    formData.append('file', largeFile);
    formData.append('order_id', 'test-order-id');

    const response = await request.post(`${API_BASE_URL}/api/b2b/ai-extraction/upload`, {
      data: formData,
    });

    expect(response.status()).toBe(413);
  });
});
