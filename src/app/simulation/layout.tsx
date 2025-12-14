import { Metadata } from 'next';

export const metadata: Metadata = {
    title: '自動見積もり',
    description: 'パッケージの仕様を選択して、リアルタイムで概算見積もりを確認できます。',
};

export default function SimulationLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
