/**
 * About Page
 *
 * 会社概要ページ
 * - 会社情報
 * - ビジョン・ミッション
 * - 会社沿革
 */

import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '会社概要 | Epackage Lab',
  description: 'Epackage Labの会社情報、ビジョン、ミッションをご紹介します。',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary-dark text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              会社概要
            </h1>
            <p className="text-xl text-white/90">
              革新的な包装ソリューションで、
              <br />
              お客様のビジネスを次のステージへ
            </p>
          </div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-text-primary mb-8 text-center">
              会社情報
            </h2>

            <div className="grid md:grid-cols-2 gap-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <div>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-text-muted">会社名</dt>
                    <dd className="text-lg text-text-primary">Epackage Lab株式会社</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-text-muted">設立</dt>
                    <dd className="text-lg text-text-primary">2020年4月</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-text-muted">資本金</dt>
                    <dd className="text-lg text-text-primary">1,000万円</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-text-muted">所在地</dt>
                    <dd className="text-lg text-text-primary">
                      〒100-0001<br />
                      東京都千代田区千代田1-1-1
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-text-muted">代表取締役</dt>
                    <dd className="text-lg text-text-primary">山田太郎</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-text-muted">従業員数</dt>
                    <dd className="text-lg text-text-primary">50名</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-text-muted">事業内容</dt>
                    <dd className="text-lg text-text-primary">
                      包装資材の製造・販売<br />
                      包装設計・コンサルティング
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-text-muted">取引銀行</dt>
                    <dd className="text-lg text-text-primary">
                      三菱UFJ銀行<br />
                      みずほ銀行
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 bg-bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-text-primary mb-12 text-center">
              ビジョン・ミッション
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-2xl font-bold text-text-primary mb-4">
                  ビジョン
                </h3>
                <p className="text-text-muted leading-relaxed">
                  包装の可能性を広げ、持続可能な未来を創造する。
                  お客様のニーズに合わせた最適な包装ソリューションを提供し、
                  业界のリーディングカンパニーとして、
                  社会に貢献します。
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md">
                <div className="text-4xl mb-4">💡</div>
                <h3 className="text-2xl font-bold text-text-primary mb-4">
                  ミッション
                </h3>
                <ul className="space-y-3 text-text-muted">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    高品質な包装資材の提供
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    環境に配慮した持続可能な包装
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    お客様満足度の最大化
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    技術革新への挑戦
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Values */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-text-primary mb-12 text-center">
              企業理念
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🌱</span>
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-3">
                  環境配慮
                </h3>
                <p className="text-text-muted">
                  地球環境を守るため、
                  環境に優しい素材と
                  製造プロセスを採用しています。
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⚡</span>
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-3">
                  スピード対応
                </h3>
                <p className="text-text-muted">
                  お客様のニーズに
                  迅速に対応するため、
                  効率的な体制を整えています。
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🤝</span>
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-3">
                  パートナーシップ
                </h3>
                <p className="text-text-muted">
                  お客様との長期的な
                  パートナーシップを重視し、
                  共に成長します。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            お問い合わせ・お見積もり
          </h2>
          <p className="text-xl text-white/90 mb-8">
            包装ソリューションについて、
            お気軽にご相談ください
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-block bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              お問い合わせ
            </Link>
            <Link
              href="/quote-simulator"
              className="inline-block bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              見積もる
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
