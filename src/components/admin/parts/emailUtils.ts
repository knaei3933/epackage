/**
 * Utility functions for EmailComposer.
 */

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export function getFileIconColor(type: string): string {
  if (type.startsWith('image/')) return 'text-purple-600 bg-purple-100';
  if (type.includes('pdf')) return 'text-red-600 bg-red-100';
  if (type.includes('word') || type.includes('document')) return 'text-blue-600 bg-blue-100';
  if (type.includes('excel') || type.includes('spreadsheet')) return 'text-green-600 bg-green-100';
  return 'text-gray-600 bg-gray-100';
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
