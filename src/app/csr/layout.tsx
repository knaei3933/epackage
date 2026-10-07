import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '社会的責任（CSR）',
  description:
    '金井貿易株式会社とEpackage LabのCSR取り組み。環境保護、社会貢献、持続可能な包装資材の提供についてご紹介します。',
  alternates: {
    canonical: '/csr',
  },
  openGraph: {
    title: '社会的責任（CSR） | Epackage Lab',
    description:
      '環境保護と社会貢献を通じて、持続可能な包装資材の未来を支えるEpackage LabのCSR取り組みをご紹介します。',
    url: '/csr',
    type: 'website',
  },
};

export default function CSRLayout({ children }: { children: React.ReactNode }) {
  return children;
}
