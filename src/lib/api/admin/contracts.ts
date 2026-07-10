import { postJson } from '@/lib/api-fetch';

export async function downloadContractPdf(contractId: string): Promise<Blob> {
  const response = await fetch(`/api/admin/contracts/${contractId}/pdf`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to generate PDF');
  return response.blob();
}
