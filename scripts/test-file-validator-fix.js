/**
 * Quick test script to verify the file validator fix
 * Tests that binary files don't get false positives for content patterns
 */

const path = require('path');
const fs = require('fs');

// Mock File object
class MockFile {
  constructor(buffer, name, type) {
    this.buffer = buffer;
    this.name = name;
    this.type = type;
    this.size = buffer.length;
  }

  async arrayBuffer() {
    return this.buffer.buffer.slice(
      this.buffer.byteOffset,
      this.buffer.byteOffset + this.buffer.byteLength
    );
  }
}

// Test cases
async function testFileValidator() {
  console.log('=== Testing File Validator Fix ===\n');

  // Import the validator
  const validator = require('../src/lib/file-validator/security-validator.ts');

  // Test 1: AI file with byte patterns that look like SQL injection
  console.log('Test 1: AI file with suspicious byte sequences');
  const aiContent = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x27, 0x2D, 0x2D, 0x23]); // %PDF'--#
  const aiFile = new MockFile(aiContent, 'design.ai', 'application/illustrator');
  const aiResult = await validator.validateFileSecurity(aiFile);

  console.log('  File: design.ai');
  console.log('  Magic Number Valid:', aiResult.fileInfo.hasValidMagicNumber);
  console.log('  Detected Type:', aiResult.fileInfo.detectedType);
  console.log('  Malicious Content Errors:', aiResult.errors.filter(e => e.code === 'MALICIOUS_CONTENT_DETECTED').length);
  console.log('  Is Valid:', aiResult.isValid);

  if (aiResult.errors.some(e => e.code === 'MALICIOUS_CONTENT_DETECTED')) {
    console.log('  ❌ FAIL: Binary AI file was incorrectly flagged for malicious content');
    process.exit(1);
  } else {
    console.log('  ✓ PASS: Binary AI file was not flagged for content patterns');
  }

  // Test 2: PDF with bytes that look like SQL patterns
  console.log('\nTest 2: PDF with suspicious byte sequences');
  const pdfContent = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x27, 0x27]); // %PDF''
  const pdfFile = new MockFile(pdfContent, 'document.pdf', 'application/pdf');
  const pdfResult = await validator.validateFileSecurity(pdfFile);

  console.log('  File: document.pdf');
  console.log('  Magic Number Valid:', pdfResult.fileInfo.hasValidMagicNumber);
  console.log('  Detected Type:', pdfResult.fileInfo.detectedType);
  console.log('  Malicious Content Errors:', pdfResult.errors.filter(e => e.code === 'MALICIOUS_CONTENT_DETECTED').length);

  if (pdfResult.errors.some(e => e.code === 'MALICIOUS_CONTENT_DETECTED')) {
    console.log('  ❌ FAIL: Binary PDF file was incorrectly flagged for malicious content');
    process.exit(1);
  } else {
    console.log('  ✓ PASS: Binary PDF file was not flagged for content patterns');
  }

  // Test 3: Text file with actual malicious content should still be caught
  console.log('\nTest 3: Text file with actual malicious content');
  const htmlContent = '<script>alert("XSS")</script>';
  const htmlBuffer = Buffer.from(htmlContent);
  const htmlFile = new MockFile(htmlBuffer, 'malicious.html', 'text/html');
  const htmlResult = await validator.validateFileSecurity(htmlFile);

  console.log('  File: malicious.html');
  console.log('  Malicious Content Errors:', htmlResult.errors.filter(e => e.code === 'MALICIOUS_CONTENT_DETECTED').length);

  if (!htmlResult.errors.some(e => e.code === 'MALICIOUS_CONTENT_DETECTED')) {
    console.log('  ❌ FAIL: Text file with malicious content was not caught');
    process.exit(1);
  } else {
    console.log('  ✓ PASS: Text file with malicious content was correctly detected');
  }

  // Test 4: JPEG with arbitrary bytes
  console.log('\nTest 4: JPEG with arbitrary byte sequences');
  const jpegContent = Buffer.concat([
    Buffer.from([0xFF, 0xD8, 0xFF]), // JPEG magic number
    Buffer.from([0x27, 0x27, 0x2D, 0x2D, 0x23, 0x23]), // Bytes that look like patterns
  ]);
  const jpegFile = new MockFile(jpegContent, 'image.jpg', 'image/jpeg');
  const jpegResult = await validator.validateFileSecurity(jpegFile);

  console.log('  File: image.jpg');
  console.log('  Magic Number Valid:', jpegResult.fileInfo.hasValidMagicNumber);
  console.log('  Malicious Content Errors:', jpegResult.errors.filter(e => e.code === 'MALICIOUS_CONTENT_DETECTED').length);

  if (jpegResult.errors.some(e => e.code === 'MALICIOUS_CONTENT_DETECTED')) {
    console.log('  ❌ FAIL: Binary JPEG file was incorrectly flagged for malicious content');
    process.exit(1);
  } else {
    console.log('  ✓ PASS: Binary JPEG file was not flagged for content patterns');
  }

  console.log('\n=== All Tests Passed! ===');
  console.log('Binary files are now correctly exempt from text-based pattern matching.');
  process.exit(0);
}

// Run the test
testFileValidator().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
