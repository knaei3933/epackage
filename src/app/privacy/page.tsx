import React from 'react'
import { Metadata } from 'next'
import { Shield, Lock, Mail, Database, Eye, Trash2, Globe, Clock, FileText } from 'lucide-react'
import { Container } from '@/components/ui/Container'

export const metadata: Metadata = {
  title: '個人情報保護方針 | Epackage Lab',
  description: 'Epackage Labの個人情報保護方針。お客様の個人情報を適切に取得、利用、管理し、安全かつ公正に取り扱うことをお約束します。',
  keywords: ['個人情報保護方針', 'プライバシーポリシー', '個人情報', 'データ保護', 'GDPR', 'プライバシー'],
}

export default function PrivacyPolicy() {
  const currentDate = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="min-h-screen bg-bg-primary">
      <Container size="4xl" className="py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-brixa-100 dark:bg-brixa-900 rounded-full">
                <Shield className="h-12 w-12 text-brixa-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-text-primary mb-4">
              個人情報保護方針
            </h1>
            <p className="text-lg text-text-secondary">
              お客様の個人情報を適切に保護することをお約束します
            </p>
          </div>

          {/* Company Information */}
          <div className="bg-surface-secondary rounded-xl p-6 mb-8 border border-border-medium">
            <h2 className="text-xl font-semibold text-text-primary mb-4">運営者情報</h2>
            <div className="grid md:grid-cols-2 gap-4 text-text-secondary">
              <div>
                <span className="font-medium">会社名：</span>
                <span className="ml-2">金井貿易株式会社</span>
              </div>
              <div>
                <span className="font-medium">法人番号：</span>
                <span className="ml-2">2120001240201</span>
              </div>
              <div>
                <span className="font-medium">所在地：</span>
                <span className="ml-2">兵庫県明石市上ノ丸2-11-21</span>
              </div>
              <div>
                <span className="font-medium">代表者：</span>
                <span className="ml-2">金　乾雄</span>
              </div>
              <div>
                <span className="font-medium">電話番号：</span>
                <span className="ml-2">050-1793-6500</span>
              </div>
              <div>
                <span className="font-medium">メール：</span>
                <span className="ml-2">info@package-lab.com</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            {/* 1. Basic Principles */}
            <section className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-border-medium">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-brixa-100 dark:bg-brixa-900 rounded-lg flex items-center justify-center">
                  <Lock className="h-5 w-5 text-brixa-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-primary mb-4">1. 基本原則</h2>
                  <div className="space-y-3 text-text-secondary leading-relaxed">
                    <p>
                      弊社は、個人情報保護法（平成15年法律第57号）および関連法規を遵守し、お客様の個人情報を適切に取り扱うことを基本原則とします。
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>個人情報の適正な取得と利用目的の明確化</li>
                      <li>安全管理措置の徹底と情報漏えいの防止</li>
                      <li>お客様の権利の尊重と透明性の確保</li>
                      <li>法令遵守と継続的改善の実施</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Types of Personal Information */}
            <section className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-border-medium">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-brixa-100 dark:bg-brixa-900 rounded-lg flex items-center justify-center">
                  <Database className="h-5 w-5 text-brixa-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-primary mb-4">2. 取得する個人情報の種類</h2>
                  <div className="space-y-3 text-text-secondary leading-relaxed">
                    <p>
                      弊社が事業活動の過程で取得する個人情報は以下の通りです：
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <h3 className="font-semibold text-text-primary mb-2">基本情報</h3>
                        <ul className="space-y-1">
                          <li>• 氏名</li>
                          <li>• 郵便番号、住所</li>
                          <li>• 電話番号</li>
                          <li>• メールアドレス</li>
                          <li>• 生年月日（お問い合わせの際にご提供いただく場合）</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary mb-2">技術情報</h3>
                        <ul className="space-y-1">
                          <li>• IPアドレス</li>
                          <li>• クッキー情報</li>
                          <li>• アクセスログ</li>
                          <li>• ブラウザ情報</li>
                          <li>• デバイス情報</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Purpose of Use */}
            <section className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-border-medium">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-brixa-100 dark:bg-brixa-900 rounded-lg flex items-center justify-center">
                  <Eye className="h-5 w-5 text-brixa-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-primary mb-4">3. 利用目的</h2>
                  <div className="space-y-3 text-text-secondary leading-relaxed">
                    <p>
                      弊社が個人情報を利用する目的は以下の通りです：
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>お客様への製品・サービスのご案内と提供</li>
                      <li>お問い合わせへの対応とサポートの提供</li>
                      <li>見積作成、受発注、納品などの業務遂行</li>
                      <li>製品の改善と新サービスの開発</li>
                      <li>品質管理と顧客満足度向上</li>
                      <li>法令に基づく義務履行</li>
                      <li>マーケティングリサーチと分析</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. Collection Method */}
            <section className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-border-medium">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-brixa-100 dark:bg-brixa-900 rounded-lg flex items-center justify-center">
                  <Globe className="h-5 w-5 text-brixa-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-primary mb-4">4. 取得方法</h2>
                  <div className="space-y-3 text-text-secondary leading-relaxed">
                    <p>
                      弊社は以下の方法で個人情報を取得します：
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>お客様から直接提供いただく情報（お問い合わせフォーム、見積依頼など）</li>
                      <li>ウェブサイトのアクセスログから自動的に収集される技術情報</li>
                      <li>クッキー及び類似技術を通じて収集される行動情報</li>
                      <li>営業活動、商談等における対面での情報収集</li>
                    </ul>
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4">
                      <p className="text-sm">
                        <strong>注意：</strong>お客様は個人情報の提供を拒否することができます。ただし、必要な情報が提供されない場合、サービスの全部または一部をご利用いただけないことがあります。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. Third-party Sharing */}
            <section className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-border-medium">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-brixa-100 dark:bg-brixa-900 rounded-lg flex items-center justify-center">
                  <Mail className="h-5 w-5 text-brixa-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-primary mb-4">5. 第三者提供</h2>
                  <div className="space-y-3 text-text-secondary leading-relaxed">
                    <p>
                      弊社は、法令で定められた場合を除き、お客様の個人情報を事前に同意を得ることなく第三者に提供することはありません。
                    </p>
                    <div className="space-y-2 mt-4">
                      <h3 className="font-semibold text-text-primary">法令に基づく提供例外：</h3>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>人命、身体、財産の保護のため必要な場合</li>
                        <li>公衆衛生の向上又は児童の健全な育成の推進のため必要な場合</li>
                        <li>国の機関等が法令の定める事務を遂行するため必要な場合</li>
                        <li>その他法令に定められている場合</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 6. Retention Period */}
            <section className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-border-medium">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-brixa-100 dark:bg-brixa-900 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-brixa-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-primary mb-4">6. 保存期間</h2>
                  <div className="space-y-3 text-text-secondary leading-relaxed">
                    <p>
                      弊社は、個人情報の利用目的が達成された場合、法令で定められた期間を超えて保存することはありません。保存期間は以下の通りです：
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <h3 className="font-semibold text-text-primary mb-2">契約関連情報</h3>
                        <p>契約期間終了後5年間（税法・商法等の定める期間）</p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary mb-2">お問い合わせ情報</h3>
                        <p>対応完了後1年間（必要に応じて延長）</p>
                      </div>
                    </div>
                    <p className="mt-4">
                      保存期間経過後は、適切な方法で確実に削除または破棄いたします。
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 7. Cookie Policy */}
            <section className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-border-medium">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-brixa-100 dark:bg-brixa-900 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-brixa-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-primary mb-4">7. クッキーポリシー</h2>
                  <div className="space-y-3 text-text-secondary leading-relaxed">
                    <p>
                      弊社ウェブサイトでは、利便性の向上と分析の目的でクッキーを使用しています。クッキーとは、ウェブサイトがお客様のブラウザに保存する小さなテキストファイルです。
                    </p>
                    <div className="space-y-2 mt-4">
                      <h3 className="font-semibold text-text-primary">クッキーの種類：</h3>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li><strong>必須クッキー：</strong>ウェブサイトの基本機能のために必須</li>
                        <li><strong>分析クッキー：</strong>ウェブサイト利用状況の分析と改善</li>
                        <li><strong>マーケティングクッキー：</strong>関連製品・サービスのご案内</li>
                      </ul>
                    </div>
                    <p className="mt-4">
                      お客様はブラウザの設定によりクッキーの受け取りを拒否することができます。ただし、クッキーを無効にすると、一部の機能が正常に動作しない場合があります。
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 8. User Rights */}
            <section className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-border-medium">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-brixa-100 dark:bg-brixa-900 rounded-lg flex items-center justify-center">
                  <Trash2 className="h-5 w-5 text-brixa-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-primary mb-4">8. お客様の権利</h2>
                  <div className="space-y-3 text-text-secondary leading-relaxed">
                    <p>
                      お客様には以下の権利があります。ご希望の場合は、所定の手続きに従ってご請求いただけます。
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <h3 className="font-semibold text-text-primary mb-2">要求可能な権利：</h3>
                        <ul className="space-y-1">
                          <li>• 個人情報の開示請求</li>
                          <li>• 内容の訂正、追加または削除請求</li>
                          <li>• 利用の停止または消去請求</li>
                          <li>• 第三者提供の停止請求</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary mb-2">請求方法：</h3>
                        <ul className="space-y-1">
                          <li>• 書面でのご請求</li>
                          <li>• メールでのご請求</li>
                          <li>• 本人確認書類の提出</li>
                          <li>• 手数料（実費）のご負担</li>
                        </ul>
                      </div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
                      <p className="text-sm">
                        <strong>ご連絡先：</strong>個人情報に関するお問い合わせは、info@package-lab.com までご連絡ください。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 9. Security Measures */}
            <section className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-border-medium">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-brixa-100 dark:bg-brixa-900 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-brixa-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-primary mb-4">9. 安全管理措置</h2>
                  <div className="space-y-3 text-text-secondary leading-relaxed">
                    <p>
                      弊社は、個人情報の安全確保のため、以下の措置を講じています：
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li><strong>組織的措施：</strong>個人情報保護管理者の配置と従業者の教育</li>
                      <li><strong>物理的措施：</strong>入退室管理、機器・帳票の施錠等</li>
                      <li><strong>技術的措施：</strong>SSL/TLSによる通信の暗号化、アクセス制御</li>
                      <li><strong>人的的措施：</strong>秘密保持義務の課程と従業への教育</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* 10. Inquiries */}
            <section className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-border-medium">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-brixa-100 dark:bg-brixa-900 rounded-lg flex items-center justify-center">
                  <Mail className="h-5 w-5 text-brixa-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-primary mb-4">10. お問い合わせ窓口</h2>
                  <div className="space-y-3 text-text-secondary leading-relaxed">
                    <p>
                      個人情報の取扱いに関するご質問や苦情については、以下の窓口までお問い合わせください。
                    </p>
                    <div className="bg-surface-secondary rounded-lg p-4 mt-4">
                      <p className="font-medium text-text-primary">個人情報保護管理者</p>
                      <p>金　乾雄</p>
                      <p>兵庫県明石市上ノ丸2-11-21</p>
                      <p>電話：050-1793-6500</p>
                      <p>メール：info@package-lab.com</p>
                    </div>
                    <p className="mt-4">
                      お客様からのご意見やご要望を真摯に受け止め、速やかに対応することをお約束します。
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Update Information */}
            <section className="bg-surface-secondary rounded-xl p-6 border border-border-medium">
              <div className="text-center text-text-secondary">
                <p className="mb-2">
                  <strong>最終更新日：</strong>{currentDate}
                </p>
                <p className="text-sm">
                  本個人情報保護方針は、関連法規の改正や事業内容の変更に伴い、予告なく変更される場合があります。
                </p>
              </div>
            </section>
          </div>
        </div>
      </Container>
    </div>
  )
}