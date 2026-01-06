import React from 'react'
import { Metadata } from 'next'
import { FileText, Users, CreditCard, AlertTriangle, Scale, Clock, Mail, CheckCircle } from 'lucide-react'
import { Container } from '@/components/ui/Container'

export const metadata: Metadata = {
  title: '利用規約 | Epackage Lab',
  description: 'Epackage Labサービスの利用規約。本サービスの利用条件、利用者の責任、知的財産権、禁止行為等について定めています。',
  keywords: ['利用規約', 'サービス利用規約', '利用条件', '規約', 'terms of service'],
}

export default function TermsOfService() {
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
                <FileText className="h-12 w-12 text-brixa-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-text-primary mb-4">
              利用規約
            </h1>
            <p className="text-lg text-text-secondary">
              Epackage Labサービスの利用条件に関する規約
            </p>
          </div>

          {/* Company Information */}
          <div className="bg-surface-secondary rounded-xl p-6 mb-8 border border-border-medium">
            <h2 className="text-xl font-semibold text-text-primary mb-4">契約当事者</h2>
            <div className="grid md:grid-cols-2 gap-4 text-text-secondary">
              <div>
                <span className="font-medium">事業者：</span>
                <span className="ml-2">金井貿易株式会社</span>
              </div>
              <div>
                <span className="font-medium">ユーザー：</span>
                <span className="ml-2">本規約に同意の上、本サービスを利用するお客様</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            {/* 1. General Provisions */}
            <section className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-border-medium">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-brixa-100 dark:bg-brixa-900 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-brixa-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-primary mb-4">第1条 総則</h2>
                  <div className="space-y-3 text-text-secondary leading-relaxed">
                    <p>
                      本利用規約（以下「本規約」という）は、金井貿易株式会社（以下「当社」という）が提供するEpackage Labウェブサイトおよび関連サービス（以下「本サービス」という）の利用条件を定めるものです。
                    </p>
                    <ol className="list-decimal list-inside space-y-2 ml-4">
                      <li>本規約は、本サービスを利用するすべてのお客様（以下「利用者」という）に適用されます。</li>
                      <li>利用者は、本サービスを利用することにより、本規約のすべての条項に同意したものとみなします。</li>
                      <li>利用者が未成年者の場合、法定代理人の同意を得た上で本サービスを利用するものとします。</li>
                      <li>本規約に同意しない場合は、本サービスをご利用いただけません。</li>
                    </ol>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Service Description */}
            <section className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-border-medium">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-brixa-100 dark:bg-brixa-900 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-brixa-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-primary mb-4">第2条 サービスの内容</h2>
                  <div className="space-y-3 text-text-secondary leading-relaxed">
                    <p>
                      本サービスの内容は以下の通りです：
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>包装材料の製品カタログ提供</li>
                      <li>見積作成および価格計算サービス</li>
                      <li>サンプル請求サービス</li>
                      <li>製品に関する技術情報提供</li>
                      <li>お問い合わせ対応およびコンサルティング</li>
                      <li>その他、当社が適切と判断する関連サービス</li>
                    </ul>
                    <p className="mt-4">
                      当社は、業務上の理由により、本サービスの内容を変更または追加することがあります。
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Registration and User Responsibilities */}
            <section className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-border-medium">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-brixa-100 dark:bg-brixa-900 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-brixa-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-primary mb-4">第3条 登録および利用者の責任</h2>
                  <div className="space-y-3 text-text-secondary leading-relaxed">
                    <h3 className="font-semibold text-text-primary">利用者の責務：</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>真実、正確、最新の情報を登録すること</li>
                      <li>登録情報が変更された場合、速やかに更新すること</li>
                      <li>IDおよびパスワードを第三者に開示・貸与しないこと</li>
                      <li>本サービスを不正な目的で利用しないこと</li>
                      <li>法令、公序良俗に反する行為をしないこと</li>
                      <li>他の利用者や第三者の権利を侵害しないこと</li>
                    </ul>
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mt-4">
                      <p className="text-sm">
                        <strong>注意：</strong>利用者が自身の責任で管理するIDおよびパスワードを用いて行われたすべての行為について、当社は責任を負いません。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. Fees and Payment */}
            <section className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-border-medium">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-brixa-100 dark:bg-brixa-900 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-brixa-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-primary mb-4">第4条 利用料金および支払方法</h2>
                  <div className="space-y-3 text-text-secondary leading-relaxed">
                    <h3 className="font-semibold text-text-primary">利用料金：</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>本サービスの基本的な利用は無料とします。</li>
                      <li>有料オプションサービスを提供する場合、事前に料金を明示します。</li>
                      <li>送料、手数料等の実費が必要な場合は、別途ご請求いたします。</li>
                    </ul>

                    <h3 className="font-semibold text-text-primary mt-4">支払方法：</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>銀行振込</li>
                      <li>クレジットカード決済</li>
                      <li>その他、当社が指定する支払方法</li>
                    </ul>

                    <p className="mt-4">
                      請求書の発行後、指定した期日までにお支払いいただけない場合、延滞利息（年14.6%）が発生する場合があります。
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. Intellectual Property */}
            <section className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-border-medium">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-brixa-100 dark:bg-brixa-900 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-brixa-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-primary mb-4">第5条 知的財産権</h2>
                  <div className="space-y-3 text-text-secondary leading-relaxed">
                    <p>
                      本サービスに関連するすべての知的財産権（著作権、商標権、意匠権等）は当社または正当な権利者に帰属します。
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>利用者は、当社の事前の書面による承諾なく、本サービスのコンテンツを複製、転載、販売、その他営利目的で利用することはできません。</li>
                      <li>利用者が本サービスを通じて投稿したコンテンツについて、利用者自身が著作権を有するものを除き、当社が無償で利用できるものとします。</li>
                      <li>利用者は、第三者の知的財産権を侵害しないことを保証するものとします。</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* 6. Prohibited Acts */}
            <section className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-border-medium">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-brixa-100 dark:bg-brixa-900 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-brixa-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-primary mb-4">第6条 禁止行為</h2>
                  <div className="space-y-3 text-text-secondary leading-relaxed">
                    <p>
                      利用者は、本サービスの利用に際して、以下の行為を行ってはなりません。
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>法令または公序良俗に反する行為</li>
                      <li>犯罪行為またはそれに結びつく行為</li>
                      <li>当社または第三者の著作権、その他知的財産権を侵害する行為</li>
                      <li>当社または第三者の名誉、信用を損なう行為</li>
                      <li>不当な目的で本サービスを利用する行為</li>
                      <li>本サービスの運営を妨害する行為</li>
                      <li>コンピュータウイルス等有害プログラムの送信または設置</li>
                      <li>その他、当社が不適切と判断する行為</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* 7. Disclaimer */}
            <section className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-border-medium">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-brixa-100 dark:bg-brixa-900 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-brixa-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-primary mb-4">第7条 免責事項</h2>
                  <div className="space-y-3 text-text-secondary leading-relaxed">
                    <p>
                      当社は、以下の場合について、一切の責任を負いません。
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>本サービスの利用に起因して利用者に生じた損害（ただし、当社に故意または重大な過失がある場合を除きます）</li>
                      <li>通信回線、コンピュータ等の障害によりサービスが提供できない場合</li>
                      <li>利用者の使用環境に起因する不具合や損害</li>
                      <li>第三者の行為により本サービスの利用ができなくなった場合</li>
                      <li>地震、火災、停電等の不可抗力によりサービスが提供できない場合</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* 8. Limitation of Liability */}
            <section className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-border-medium">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-brixa-100 dark:bg-brixa-900 rounded-lg flex items-center justify-center">
                  <Scale className="h-5 w-5 text-brixa-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-primary mb-4">第8条 賠償責任の制限</h2>
                  <div className="space-y-3 text-text-secondary leading-relaxed">
                    <p>
                      当社が本サービスに関して利用者に賠償すべき損害賠償責任は、当該損害が発生した月における利用者が当社に支払った利用料金の月額（無料の場合は0円）を上限とします。
                    </p>
                    <p>
                      ただし、これは、当社に故意または重大な過失がある場合には適用されません。
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 9. Cancellation */}
            <section className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-border-medium">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-brixa-100 dark:bg-brixa-900 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-brixa-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-primary mb-4">第9条 契約の解除</h2>
                  <div className="space-y-3 text-text-secondary leading-relaxed">
                    <p>
                      利用者は、いつでも本規約に同意しないものとして、本サービスの利用を中止することができます。
                    </p>
                    <p>
                      当社は、以下の場合、利用者への事前の通知なく、本サービスの全部または一部の提供を中止または変更することがあります。
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>本サービスの保守、点検、更新のため</li>
                      <li>火災、停電等の不可抗力によりサービスの提供が困難な場合</li>
                      <li>その他、当社が合理的に判断する場合</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* 10. Dispute Resolution */}
            <section className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-border-medium">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-brixa-100 dark:bg-brixa-900 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-brixa-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-primary mb-4">第10条 紛争解決</h2>
                  <div className="space-y-3 text-text-secondary leading-relaxed">
                    <p>
                      本サービスに関連する紛争については、当事者間の誠意ある協議により解決を図るものとします。
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <h3 className="font-semibold text-text-primary mb-2">準拠法：</h3>
                        <p>日本法を準拠法とします。</p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary mb-2">管轄裁判所：</h3>
                        <p>東京地方裁判所を専属的合意管轄裁判所とします。</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 11. Electronic Contract */}
            <section className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-border-medium">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-brixa-100 dark:bg-brixa-900 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-brixa-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-primary mb-4">第11条 電子契約の成立</h2>
                  <div className="space-y-3 text-text-secondary leading-relaxed">
                    <p>
                      本規約に関する合意は、利用者が本サービスにアクセスし、本規約に同意する操作を行った時点で成立するものとします。
                    </p>
                    <p>
                      本契約は電子消費者契約法及び電子署名法に基づく電子契約として有効に成立します。
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 12. Refund Policy */}
            <section className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-border-medium">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-brixa-100 dark:bg-brixa-900 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-brixa-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-primary mb-4">第12条 返金・交換ポリシー</h2>
                  <div className="space-y-3 text-text-secondary leading-relaxed">
                    <h3 className="font-semibold text-text-primary">基本方針：</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>デジタルコンテンツの性質上、原則として返金・交換はできません。</li>
                      <li>有料サービスの場合、ご購入後8日以内のご理由による返金に応じます。</li>
                      <li>当社の責任による不具合の場合、全額返金いたします。</li>
                    </ul>

                    <h3 className="font-semibold text-text-primary mt-4">返金手続き：</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>返金をご希望の場合、 kim@kanei-trade.co.jp までご連絡ください。</li>
                      <li>返金処理には、ご連絡後10営業日程度かかる場合があります。</li>
                      <li>返金方法は、原則としてお支払いいただいた方法と同様の方法で行います。</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* 13. Modifications */}
            <section className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-border-medium">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-brixa-100 dark:bg-brixa-900 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-brixa-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-primary mb-4">第13条 規約の変更</h2>
                  <div className="space-y-3 text-text-secondary leading-relaxed">
                    <p>
                      当社は、必要と判断した場合、利用者に事前に通知することなく本規約を変更できるものとします。
                    </p>
                    <p>
                      変更された規約は、本サービス上に掲載された時点から効力を生じるものとします。
                    </p>
                    <p>
                      利用者が変更後の規約に同意しない場合、本サービスの利用を中止することができます。
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 14. Personal Information Protection */}
            <section className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-border-medium">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-brixa-100 dark:bg-brixa-900 rounded-lg flex items-center justify-center">
                  <Mail className="h-5 w-5 text-brixa-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-primary mb-4">第14条 個人情報の取扱い</h2>
                  <div className="space-y-3 text-text-secondary leading-relaxed">
                    <p>
                      当社は、利用者の個人情報を個人情報保護法その他関連法規に従い、適切に取り扱うものとします。
                    </p>
                    <p>
                      個人情報の取得、利用、管理、第三者提供等に関する詳細は、<a href="/privacy" className="text-brixa-600 hover:underline">個人情報保護方針</a>に定めるとおりです。
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-border-medium">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-brixa-100 dark:bg-brixa-900 rounded-lg flex items-center justify-center">
                  <Mail className="h-5 w-5 text-brixa-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-primary mb-4">お問い合わせ</h2>
                  <div className="space-y-3 text-text-secondary leading-relaxed">
                    <p>
                      本規約に関するご質問やご不明な点がございましたら、以下までお問い合わせください。
                    </p>
                    <div className="bg-surface-secondary rounded-lg p-4 mt-4">
                      <p className="font-medium text-text-primary">金井貿易株式会社</p>
                      <p>〒673-0846 兵庫県明石市上ノ丸2-11-21 レラフォール102</p>
                      <p>電話：+81-80-6942-7235</p>
                      <p>メール：kim@kanei-trade.co.jp</p>
                    </div>
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
                  本利用規約は、法令改正、事業内容の変更等により変更される場合があります。
                </p>
              </div>
            </section>
          </div>
        </div>
      </Container>
    </div>
  )
}