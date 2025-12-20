import React from 'react'
import { Building2, CreditCard, Package, Truck, Users, FileText, Clock, Phone, Mail, MapPin, AlertTriangle, CheckCircle } from 'lucide-react'
import { Container } from '@/components/ui/Container'

export default function LegalPage() {
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
              特定商取引法に基づく表示
            </h1>
            <p className="text-lg text-text-secondary">
              通信販売・オンラインサービスに関する法令表示事項
            </p>
          </div>

          {/* Company Information */}
          <div className="bg-surface-secondary rounded-xl p-6 mb-8 border border-border-medium">
            <h2 className="text-xl font-semibold text-text-primary mb-4">販売業者情報</h2>
            <div className="grid md:grid-cols-2 gap-4 text-text-secondary">
              <div>
                <span className="font-medium">販売業者：</span>
                <span className="ml-2">金井貿易株式会社</span>
              </div>
              <div>
                <span className="font-medium">運営責任者：</span>
                <span className="ml-2">金　乾雄</span>
              </div>
              <div>
                <span className="font-medium">住所：</span>
                <span className="ml-2">〒673-0846 兵庫県明石市上ノ丸2-11-21 レラフォール102</span>
              </div>
              <div>
                <span className="font-medium">電話番号：</span>
                <span className="ml-2">+81-80-6942-7235</span>
              </div>
              <div>
                <span className="font-medium">FAX番号：</span>
                <span className="ml-2">- (設置なし)</span>
              </div>
              <div>
                <span className="font-medium">メール：</span>
                <span className="ml-2">kim@kanei-trade.co.jp</span>
              </div>
              <div>
                <span className="font-medium">URL：</span>
                <span className="ml-2">https://www.epackage-lab.com</span>
              </div>
              <div>
                <span className="font-medium">販売価格：</span>
                <span className="ml-2">製品・サービスにより異なります</span>
              </div>
              <div>
                <span className="font-medium">支払方法：</span>
                <span className="ml-2">銀行振込、クレジットカード決済、その他指定方法</span>
              </div>
              <div>
                <span className="font-medium">商品引渡時期：</span>
                <span className="ml-2">商品・サービスにより異なります（詳細は見積時に明示）</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            {/* 1. Overview */}
            <section className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-border-medium">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-brixa-100 dark:bg-brixa-900 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-brixa-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-primary mb-4">1. 表示の概要</h2>
                  <div className="space-y-3 text-text-secondary leading-relaxed">
                    <p>
                      本表示は、特定商取引に関する法律（特定商取引法、平成12年法律第109号）および関連政令・省令に基づき、金井貿易株式会社が運営するEpackage Labサービスにおける通信販売に関する表示事項を記載したものです。
                    </p>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
                      <p className="text-sm">
                        <strong>注意：</strong>本表示は電子消費者契約法における電子情報処理組織の電磁的記録による表示として有効です。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Products */}
            <section className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-border-medium">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-brixa-100 dark:bg-brixa-900 rounded-lg flex items-center justify-center">
                  <Package className="h-5 w-5 text-brixa-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-primary mb-4">2. 販品・サービスの内容</h2>
                  <div className="space-y-3 text-text-secondary leading-relaxed">
                    <p>
                      当社が提供する製品・サービスは以下の通りです。
                    </p>

                    <div className="space-y-4 mt-4">
                      <div>
                        <h3 className="font-semibold text-text-primary mb-2">包装材料</h3>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                          <li>スタンドパウチ製品（各種サイズ・仕様）</li>
                          <li>ジップパウチ製品</li>
                          <li>ガセットパウチ製品</li>
                          <li>三方シールパウチ製品</li>
                          <li>レトルトパウチ製品</li>
                          <li>真空パウチ製品</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold text-text-primary mb-2">関連サービス</h3>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                          <li>製品カスタマイズサービス</li>
                          <li>印刷・ラミネート加工サービス</li>
                          <li>見積作成サービス</li>
                          <li>サンプル提供サービス</li>
                          <li>技術相談・コンサルティング</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4">
                      <p className="text-sm">
                        <strong>ご注意：</strong>製品の仕様、価格、納期等については、個別のご見積において明確にご提示いたします。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Pricing */}
            <section className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-border-medium">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-brixa-100 dark:bg-brixa-900 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-brixa-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-primary mb-4">3. 対価および代金</h2>
                  <div className="space-y-3 text-text-secondary leading-relaxed">
                    <p>
                      製品・サービスの価格は以下の要素を考慮して算定します。
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>製品の仕様、数量</li>
                      <li>素材・材料費</li>
                      <li>加工・製造コスト</li>
                      <li>印刷・デザイン費用（該当する場合）</li>
                      <li>配送・輸送費用</li>
                      <li>消費税（10%）</li>
                    </ul>

                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-4">
                      <p className="text-sm">
                        <strong>表示：</strong>当社が表示する価格は、消費税を含む総額表示です。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. Payment */}
            <section className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-border-medium">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-brixa-100 dark:bg-brixa-900 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-brixa-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-primary mb-4">4. 支払時期および方法</h2>
                  <div className="space-y-3 text-text-secondary leading-relaxed">

                    <h3 className="font-semibold text-text-primary mb-2">支払時期：</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>受注確認後、納品時までにお支払いいただきます</li>
                      <li>分割払いを希望される場合、ご相談に応じます</li>
                      <li>長期契約の場合は、別途支払条件を協議します</li>
                    </ul>

                    <h3 className="font-semibold text-text-primary mb-2 mt-4">支払方法：</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>銀行振込（当社指定口座）</li>
                      <li>クレジットカード決済（VISA、MasterCard等）</li>
                      <li>その他、当社が指定する電子決済サービス</li>
                      <li>現金（対面取引の場合に限る）</li>
                    </ul>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-4">
                      <p className="text-sm">
                        <strong>注意：</strong>代金のお支払いが遅延した場合、年14.6%の遅延損害金が発生する場合があります。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. Delivery */}
            <section className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-border-medium">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-brixa-100 dark:bg-brixa-900 rounded-lg flex items-center justify-center">
                  <Truck className="h-5 w-5 text-brixa-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-primary mb-4">5. 商品引渡</h2>
                  <div className="space-y-3 text-text-secondary leading-relaxed">

                    <h3 className="font-semibold text-text-primary mb-2">引渡時期：</h3>
                    <p>
                      製品の引渡時期は、受注内容や生産状況により異なりますが、一般的には以下の通りです。
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>標準製品：注文確定後14～21日</li>
                      <li>カスタム製品：見積確定後30～60日</li>
                      <li>急ぎの納品：ご相談により対応可能</li>
                    </ul>

                    <h3 className="font-semibold text-text-primary mb-2 mt-4">配送方法：</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>営業所配送（近隣地域）</li>
                      <li>宅配便・運輸会社（遠隔地）</li>
                      <li>工場直接引き渡し（大口取引）</li>
                    </ul>

                    <h3 className="font-semibold text-text-primary mb-2 mt-4">送料：</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>送料無料条件：注文金額が10万円以上の場合</li>
                      <li>有料配送：それ以外の場合、実費をご負担いただきます</li>
                      <li>遠隔地：地域により送料が異なります</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* 6. Cancellation */}
            <section className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-border-medium">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-brixa-100 dark:bg-brixa-900 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-brixa-600" />
                </div>
                <div>
                  <h2 className="textth-2xl font-bold text-text-primary mb-4">6. 申込みの取消し</h2>
                  <div className="space-y-3 text-text-secondary leading-relaxed">
                    <p>
                      お客様の都合により、申込みを取り消すことができます。
                    </p>

                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <h3 className="font-semibold text-text-primary mb-2">取り消し可能期間：</h3>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                          <li>注文確定前：いつでも可能</li>
                          <li>注文確定後：生産開始まで可能</li>
                          <li>生産開始後：原則として不可</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary mb-2">取消し手続き：</h3>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                          <li>メールまたは電話でのご連絡</li>
                          <li>注文番号のご明記</li>
                          <li>取消し理由のご説明</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mt-4">
                      <p className="text-sm">
                        <strong>注意：</strong>生産開始後の取消しには、発生した費用（材料費、加工費等）の実費相当額をご請求いただく場合があります。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 7. Returns */}
            <section className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-border-medium">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-brixa-100 dark:bg-brixa-900 rounded-lg flex items-center justify-center">
                  <Package className="h-5 w-5 text-brixa-620" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-primary mb-4">7. 返品・交換</h2>
                  <div className="space-y-3 text-text-secondary leading-relaxed">

                    <h3 className="font-semibold text-text-primary mb-2">返品・交換の条件：</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>当社の責任による不良品の場合：無期限で全額返品・交換</li>
                      <li>お客様都合による返品：商品到着後8日以内</li>
                      <li>未開封・未使用の場合：全額返品</li>
                      <li>開封後の返品：商品状態により別途協議</li>
                    </ul>

                    <h3 className="font-semibold text-text-primary mb-2 mt-4">返品・交換できない場合：</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>お客様の責任による破損・汚損</li>
                      <li>お客様の仕様通りに製造された商品</li>
                      <li>時期経過による品質の自然な変化</li>
                      <li>イメージ違いによる返品（仕様通りの場合）</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* 8. Sales Method */}
            <section className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-border-medium">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-brixa-100 dark:bg-brixa-900 rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-brixa-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-primary mb-4">8. 販売方法</h2>
                  <div className="space-y-3 text-text-secondary leading-relaxed">
                    <p>
                      弊社は、以下の方法で製品・サービスを販売します。
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>インターネットサイトを通じた通信販売</li>
                      <li>電話・FAXを通じた通信販売</li>
                      <li>メールによる見積・注文受付</li>
                      <li>対面による販売（展示会・商談等）</li>
                      <li>その他、当社が適切と判断する方法</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* 9. Communication */}
            <section className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-border-medium">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-brixa-100 dark:bg-brixa-900 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-brixa-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-primary mb-4">9. コミュニケーション</h2>
                  <div className="space-y-3 text-text-secondary leading-relaxed">
                    <p>
                      当社は、お客様との円滑なコミュニケーションのため、以下の方法でお問い合わせに対応します。
                    </p>

                    <div className="grid md:grid-cols-3 gap-4 mt-4">
                      <div>
                        <h3 className="font-semibold text-text-primary mb-2">
                          <Phone className="h-4 w-4 inline mr-2" />
                          電話
                        </h3>
                        <p className="text-sm">+81-80-6942-7235</p>
                        <p className="text-sm text-gray-500">営業時間：平日9:00-18:00</p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary mb-2">
                          <Mail className="h-4 w-4 inline mr-2" />
                          メール
                        </h3>
                        <p className="text-sm">kim@kanei-trade.co.jp</p>
                        <p className="text-sm text-gray-500">24時間対応</p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary mb-2">
                          <MapPin className="h-4 w-4 inline mr-2" />
                          所在地
                        </h3>
                        <p className="text-sm">〒673-0846 兵庫県明石市</p>
                        <p className="text-sm text-gray-500">面談予約要</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 10. Guarantee */}
            <section className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-border-medium">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-brixa-100 dark:bg-brixa-900 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-brixa-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-text-primary mb-4">10. 保証</h2>
                  <div className="space-y-3 text-text-secondary leading-relaxed">
                    <p>
                      当社は、提供する製品・サービスについて、以下の保証を行います。
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>製品仕様の品質保証</li>
                      <li>材料・製造工程の安全性保証</li>
                      <li>納期遵守の努力義務</li>
                      <li>適正なアフターサービスの提供</li>
                      <li>秘密保持義務の遵守</li>
                    </ul>

                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-4">
                      <p className="text-sm">
                        <strong>安心のマーク：</strong>当社の製品は、品質管理基準を満たしており、お客様に安心してご利用いただけます。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 11. Important Notes */}
            <section className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-border-medium">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-brixa-100 dark:bg-brixa-900 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-brixa-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-primary mb-4">11. 重要事項</h2>
                  <div className="space-y-3 text-text-secondary leading-relaxed">
                    <p>
                      本サービスの利用にあたり、お客様には以下の重要事項についてご理解いただけますようお願いします。
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>製品の特性上、色味・寸法に若干の違いが生じる場合があります</li>
                      <li>画面表示と実物との色差については、可能な範囲で調整いたします</li>
                      <li>急な価格変動・供給不足により、納期が遅延する場合があります</li>
                      <li>天候や交通状況により、配送が遅延する場合があります</li>
                      <li>大口注文の場合、納期が延長することがあります</li>
                    </ul>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
                      <p className="text-sm">
                        <strong>技術サポート：</strong>製品の使用方法やトラブルシューティングについて、専門の技術スタッフが対応いたします。
                      </p>
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
                  本表示は、事業内容の変更等により適宜更新いたします。
                </p>
              </div>
            </section>
          </div>
        </div>
      </Container>
    </div>
  )
}