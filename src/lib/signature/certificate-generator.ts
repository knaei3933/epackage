/**
 * Signature Certificate Generator (Japan e-Signature Law Compliant)
 *
 * 署名証明書生成サービス (日本の電子署名法準拠)
 * Signature Certificate PDF Generator
 */

import {
  SignatureCertificate,
  CertificateRequest,
  TimestampData,
  SignatureType,
  LEGAL_REFERENCES,
  SIGNATURE_VALIDITY_YEARS,
} from '@/types/signature';

// ============================================================
// PDF Generation Functions
// ============================================================

/**
 * Generate signature certificate PDF
 * 署名証明書PDFを生成
 */
export async function generateSignatureCertificate(
  request: CertificateRequest
): Promise<SignatureCertificate> {
  const certificateId = generateCertificateId();
  const timestamp = new Date().toISOString();

  // Calculate expiry date
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + SIGNATURE_VALIDITY_YEARS);

  // Generate certificate content
  const certificateContent = generateCertificateContent({
    certificateId,
    ...request,
    signatureType: request.signatureData.type,
    signedAt: request.signatureData.metadata.signedAt,
    generatedAt: timestamp,
    expiryDate: expiryDate.toISOString(),
  });

  // In production, this would generate an actual PDF
  // For now, we'll return a mock certificate
  const certificate: SignatureCertificate = {
    certificateId,
    contractId: request.contractId,
    orderId: request.contractDetails.contractNumber, // Using contract number as order ID reference
    signerName: request.signerName,
    signerRole: request.signerRole,
    signatureType: request.signatureData.type,
    signedAt: request.signatureData.metadata.signedAt,
    timestampData: request.timestampData,
    legalValidity: {
      compliant: true,
      lawReference: `${LEGAL_REFERENCES.ELECTRONIC_SIGNATURE_ACT.title} ${LEGAL_REFERENCES.ELECTRONIC_SIGNATURE_ACT.article}`,
      expiryDate: expiryDate.toISOString(),
    },
    certificateUrl: `/api/signature/certificates/${certificateId}`, // Mock URL
    generatedAt: timestamp,
  };

  // In production: Upload PDF to storage and get URL
  // const pdfUrl = await uploadCertificateToStorage(certificate, certificateContent);

  return certificate;
}

/**
 * Generate certificate content (for PDF)
 * 証明書コンテンツを生成
 */
function generateCertificateContent(config: {
  certificateId: string;
  signerName: string;
  signerRole: 'customer' | 'admin';
  signatureType: SignatureType;
  signedAt: string;
  timestampData: TimestampData;
  contractDetails: {
    contractNumber: string;
    contractTitle: string;
    totalAmount: number;
    currency: string;
  };
  generatedAt: string;
  expiryDate: string;
}): string {
  const {
    certificateId,
    signerName,
    signerRole,
    signatureType,
    signedAt,
    timestampData,
    contractDetails,
    generatedAt,
    expiryDate,
  } = config;

  // Format dates for Japanese display
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Signature type label
  const signatureTypeLabel: Record<SignatureType, string> = {
    handwritten: '手書き署名',
    hanko: 'はんこ署名',
    mixed: '複合署名',
  };

  // Signer role label
  const signerRoleLabel: Record<'customer' | 'admin', string> = {
    customer: '顧客',
    admin: '管理者',
  };

  return `
==================================================
電子署名証明書
ELECTRONIC SIGNATURE CERTIFICATE
==================================================

証明書番号 / Certificate ID: ${certificateId}

発行日 / Issue Date: ${formatDate(generatedAt)}
有効期限 / Valid Until: ${formatDate(expiryDate)}

==================================================
1. 契約情報 / CONTRACT INFORMATION
==================================================

契約書番号 / Contract Number: ${contractDetails.contractNumber}
契約書タイトル / Contract Title: ${contractDetails.contractTitle}
契約金額 / Contract Amount: ${contractDetails.currency} ${contractDetails.totalAmount.toLocaleString()}

==================================================
2. 署名者情報 / SIGNER INFORMATION
==================================================

署名者名 / Signer Name: ${signerName}
役割 / Role: ${signerRoleLabel[signerRole]}
署名タイプ / Signature Type: ${signatureTypeLabel[signatureType]}

署名日時 / Signed At: ${formatDate(signedAt)}
IPアドレス / IP Address: ${timestampData.timestamp}

==================================================
3. タイムスタンプ情報 / TIMESTAMP INFORMATION
==================================================

タイムスタンプ / Timestamp: ${formatDate(timestampData.timestamp)}
タイムスタンプ発行機関 / TSA: ${timestampData.tsaUrl}
トークン / Token: ${timestampData.token.substring(0, 20)}...
証明書ハッシュ / Certificate Hash: ${timestampData.certificateHash.substring(0, 20)}...

検証済み / Verified: ${timestampData.verified ? 'はい' : 'いいえ'}
${timestampData.verifiedAt ? `検証日時 / Verified At: ${formatDate(timestampData.verifiedAt)}` : ''}

==================================================
4. 法的効力 / LEGAL VALIDITY
==================================================

準拠法律 / Applicable Law:
${LEGAL_REFERENCES.ELECTRONIC_SIGNATURE_ACT.title}
${LEGAL_REFERENCES.ELECTRONIC_SIGNATURE_ACT.article}

参照URL / Reference URL:
${LEGAL_REFERENCES.ELECTRONIC_SIGNATURE_ACT.url}

法的準拠 / Legally Compliant: ${timestampData.verified ? 'はい' : 'いいえ'}
有効期限 / Validity Period: ${SIGNATURE_VALIDITY_YEARS}年

この証明書は、日本の電子署名法に基づき発行されました。
This certificate is issued in accordance with the Electronic Signature Act of Japan.

==================================================
発行者情報 / ISSUER INFORMATION
==================================================

発行者 / Issuer: EPACKAGE Lab
発行者URL / Issuer URL: https://epackage-lab.com
連絡先 / Contact: support@epackage-lab.com

この証明書は電子署名法に基づき、署名の真正性と
完全性を証明するものです。

This certificate attests to the authenticity and integrity
of the electronic signature in accordance with the
Electronic Signature Act of Japan.

==================================================
重要事項 / IMPORTANT NOTICE
==================================================

この証明書は、署名が電子署名法の要件を満たすことを証明しますが、
契約内容の正当性や法的効力を保証するものではありません。

本証明書の改変は禁止されています。疑わしい場合は発行者まで
お問い合わせください。

This certificate confirms that the signature meets the requirements
of the Electronic Signature Act but does not guarantee the
validity or legal effect of the contract content.

Unauthorized modification of this certificate is prohibited.
If you have any doubts, please contact the issuer.

==================================================
電子署名証明書の終わり / END OF CERTIFICATE
==================================================
`.trim();
}

/**
 * Generate certificate ID
 * 証明書IDを生成
 */
function generateCertificateId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `CERT-${timestamp}-${random}`.toUpperCase();
}

/**
 * Generate certificate hash
 * 証明書ハッシュを生成
 */
export async function generateCertificateHash(
  certificate: SignatureCertificate
): Promise<string> {
  const certificateString = JSON.stringify(certificate);
  const encoder = new TextEncoder();
  const data = encoder.encode(certificateString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ============================================================
// Certificate Verification
// ============================================================

/**
 * Verify certificate integrity
 * 証明書の整合性を検証
 */
export async function verifyCertificateIntegrity(
  certificate: SignatureCertificate,
  expectedHash?: string
): Promise<boolean> {
  if (!expectedHash) {
    return true; // No hash to verify against
  }

  const calculatedHash = await generateCertificateHash(certificate);
  return calculatedHash === expectedHash;
}

/**
 * Check if certificate is still valid
 * 証明書が有効か確認
 */
export function isCertificateValid(certificate: SignatureCertificate): {
  valid: boolean;
  reason?: string;
} {
  const now = new Date();
  const expiryDate = new Date(certificate.legalValidity.expiryDate);

  if (now > expiryDate) {
    return {
      valid: false,
      reason: '証明書の有効期限が切れています',
    };
  }

  if (!certificate.timestampData.verified) {
    return {
      valid: false,
      reason: 'タイムスタンプが検証されていません',
    };
  }

  return { valid: true };
}

// ============================================================
// Certificate Export
// ============================================================

/**
 * Export certificate as JSON
 * 証明書をJSONとしてエクスポート
 */
export function exportCertificateAsJSON(
  certificate: SignatureCertificate
): string {
  return JSON.stringify(certificate, null, 2);
}

/**
 * Export certificate as text
 * 証明書をテキストとしてエクスポート
 */
export function exportCertificateAsText(
  certificate: SignatureCertificate
): string {
  return generateCertificateContent({
    certificateId: certificate.certificateId,
    signerName: certificate.signerName,
    signerRole: certificate.signerRole,
    signatureType: certificate.signatureType,
    signedAt: certificate.signedAt,
    timestampData: certificate.timestampData,
    contractDetails: {
      contractNumber: certificate.certificateId.substring(5), // Extract from certificate ID
      contractTitle: '契約書',
      totalAmount: 0,
      currency: 'JPY',
    },
    generatedAt: certificate.generatedAt,
    expiryDate: certificate.legalValidity.expiryDate,
  });
}

/**
 * Download certificate
 * 証明書をダウンロード
 */
export function downloadCertificate(
  certificate: SignatureCertificate,
  format: 'json' | 'txt' = 'json'
): void {
  let content: string;
  let mimeType: string;
  let fileName: string;

  if (format === 'json') {
    content = exportCertificateAsJSON(certificate);
    mimeType = 'application/json';
    fileName = `${certificate.certificateId}.json`;
  } else {
    content = exportCertificateAsText(certificate);
    mimeType = 'text/plain';
    fileName = `${certificate.certificateId}.txt`;
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================================
// Certificate Display Utilities
// ============================================================

/**
 * Format certificate ID for display
 * 表示用証明書IDをフォーマット
 */
export function formatCertificateId(id: string): string {
  // Add hyphens for better readability
  // CERT-1234567890-ABC123 -> CERT-1234567890-ABC123
  return id;
}

/**
 * Get signature type display name
 * 署名タイプ表示名を取得
 */
export function getSignatureTypeDisplayName(type: SignatureType): string {
  const labels: Record<SignatureType, { ja: string; en: string }> = {
    handwritten: { ja: '手書き署名', en: 'Handwritten' },
    hanko: { ja: 'はんこ署名', en: 'Hanko Seal' },
    mixed: { ja: '複合署名', en: 'Mixed' },
  };
  return labels[type].ja;
}

/**
 * Get signer role display name
 * 署名者役割表示名を取得
 */
export function getSignerRoleDisplayName(role: 'customer' | 'admin'): string {
  const labels: Record<'customer' | 'admin', { ja: string; en: string }> = {
    customer: { ja: '顧客', en: 'Customer' },
    admin: { ja: '管理者', en: 'Administrator' },
  };
  return labels[role].ja;
}

/**
 * Get validity status display
 * 有効性ステータス表示を取得
 */
export function getValidityStatusDisplay(certificate: SignatureCertificate): {
  status: 'valid' | 'expired' | 'invalid';
  label: string;
  color: string;
} {
  const validation = isCertificateValid(certificate);

  if (!validation.valid) {
    return {
      status: 'invalid',
      label: validation.reason || '無効',
      color: 'red',
    };
  }

  if (certificate.legalValidity.compliant) {
    return {
      status: 'valid',
      label: '有効',
      color: 'green',
    };
  }

  return {
    status: 'invalid',
    label: '検証が必要',
    color: 'yellow',
  };
}
