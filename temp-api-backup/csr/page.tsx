import React from 'react'
import {
  Leaf,
  Heart,
  Users,
  Target,
  Award,
  Recycle,
  Globe,
  Shield,
  Handshake,
  TreePine,
  Droplets,
  Factory,
  GraduationCap
} from 'lucide-react'
import { Container } from '@/components/ui/Container'

export default function CorporateSocialResponsibility() {
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
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <Heart className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-text-primary mb-4">
              社会的責任 (CSR)
            </h1>
            <p className="text-lg text-text-secondary">
              環境保護と社会的責任を果たし、持続可能な未来を創造します
            </p>
          </div>

          {/* Company Information */}
          <div className="bg-surface-secondary rounded-xl p-6 mb-8 border border-border-medium">
            <h2 className="text-xl font-semibold text-text-primary mb-4">運営企業情報</h2>
            <div className="grid md:grid-cols-2 gap-4 text-text-secondary">
              <div>
                <span className="font-medium">会社名：</span>
                <span className="ml-2">金井貿易株式会社</span>
              </div>
              <div>
                <span className="font-medium">事業内容：</span>
                <span className="ml-2">包装材料の製造・販売、関連サービス</span>
              </div>
              <div>
                <span className="font-medium">所在地：</span>
                <span className="ml-2">〒673-0846 兵庫県明石市上ノ丸2-11-21 レラフォール102</span>
              </div>
              <div>
                <span className="font-medium">代表者：</span>
                <span className="ml-2">金　乾雄</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            {/* 1. Environmental Protection */}
            <section className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-border-medium">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <Leaf className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-text-primary mb-4">1. 環境保護政策</h2>
                  <div className="space-y-4 text-text-secondary leading-relaxed">
                    <p>
                      弊社は、環境負荷の低減と資源の持続可能な利用を最優先事項と位置づけ、事業活動の全側面で環境保護に取り組んでいます。
                    </p>

                    <div className="grid md:grid-cols-2 gap-6 mt-4">
                      <div>
                        <h3 className="font-semibold text-text-primary mb-3 flex items-center">
                          <Recycle className="h-4 w-4 mr-2 text-green-600" />
                          資源循環の推進
                        </h3>
                        <ul className="space-y-2">
                          <li>• リサイクル可能な包装材料の積極的な開発</li>
                          <li>• 生産工程での廃棄物削減（ゼロエミッション目標）</li>
                          <li>• 使用済み包装材の回収・再利用システム構築</li>
                          <li>• バイオマスプラスチックの活用推進</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold text-text-primary mb-3 flex items-center">
                          <Droplets className="h-4 w-4 mr-2 text-green-600" />
                          環境負荷低減策
                        </h3>
                        <ul className="space-y-2">
                          <li>• CO2排出量の削減と再生可能エネルギー活用</li>
                          <li>• 水資源の節約と排水処理の徹底</li>
                          <li>• 有害化学物質の使用排除と管理徹底</li>
                          <li>• 省エネ型生産設備への段階的更新</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-4">
                      <p className="text-sm">
                        <strong>環境目標：</strong>2030年までに生産工程におけるCO2排出量を50%削減し、100%リサイクル可能な製品ラインを拡充します。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Quality Management */}
            <section className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-border-medium">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-text-primary mb-4">2. 品質管理と認証</h2>
                  <div className="space-y-4 text-text-secondary leading-relaxed">
                    <p>
                      高品質な製品とサービスの提供は、当社の社会的責任の根幹をなすものです。国際的な品質管理基準に準拠し、継続的な改善活動を行っています。
                    </p>

                    <div className="grid md:grid-cols-2 gap-6 mt-4">
                      <div>
                        <h3 className="font-semibold text-text-primary mb-3 flex items-center">
                          <Award className="h-4 w-4 mr-2 text-blue-600" />
                          品質保証体制
                        </h3>
                        <ul className="space-y-2">
                          <li>• ISO 9001：2015 品質マネジメントシステム</li>
                          <li>• ISO 14001：2015 環境マネジメントシステム</li>
                          <li>• ISO 45001：2018 労働安全衛生マネジメントシステム</li>
                          <li>• FSSC 22000 食品安全マネジメントシステム</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold text-text-primary mb-3 flex items-center">
                          <Target className="h-4 w-4 mr-2 text-blue-600" />
                          品質目標と改善
                        </h3>
                        <ul className="space-y-2">
                          <li>• 製品不良率0.01%以下の維持</li>
                          <li>• 顧客満足度98%以上の達成</li>
                          <li>• 年次品質目標の策定と達成管理</li>
                          <li>• 定期的な内部監査と是正処置の実施</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
                      <p className="text-sm">
                        <strong>品質方針：</strong>「顧客満足の最大化を通じて、社会から信頼される企業となる」を品質方針とし、全従業員が品質経営に参画しています。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Community Contribution */}
            <section className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-border-medium">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-text-primary mb-4">3. 地域社会への貢献</h2>
                  <div className="space-y-4 text-text-secondary leading-relaxed">
                    <p>
                      事業活動を通じて得た資源と能力を活用し、地域社会の発展と活性化に貢献することを重要な使命と考えています。
                    </p>

                    <div className="grid md:grid-cols-2 gap-6 mt-4">
                      <div>
                        <h3 className="font-semibold text-text-primary mb-3 flex items-center">
                          <GraduationCap className="h-4 w-4 mr-2 text-purple-600" />
                          教育支援活動
                        </h3>
                        <ul className="space-y-2">
                          <li>• 地域学校への学習教材提供</li>
                          <li>• 工場見学と職業体験の受け入れ</li>
                          <li>• 環境教育プログラムの共同開発</li>
                          <li>• 若手人材育成のためのインターンシップ</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold text-text-primary mb-3 flex items-center">
                          <TreePine className="h-4 w-4 mr-2 text-purple-600" />
                          環境保全活動
                        </h3>
                        <ul className="space-y-2">
                          <li>• 地域の清掃活動への参加と支援</li>
                          <li>• 植樹活動と緑化推進</li>
                          <li>• 地域環境保護団体への寄付</li>
                          <li>• 省エネ・省資源に関する地域啓発</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mt-4">
                      <p className="text-sm">
                        <strong>地域貢献実績：</strong>年間50時間以上のボランティア活動、地域団体への100万円以上の寄付、従業員の地域活動参加率85%以上を維持しています。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. Sustainable Management */}
            <section className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-border-medium">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
                  <Globe className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-text-primary mb-4">4. 持続可能な経営戦略</h2>
                  <div className="space-y-4 text-text-secondary leading-relaxed">
                    <p>
                      経済的価値、社会的価値、環境的価値の調和を実現し、長期的視点に立った持続可能な企業経営を目指しています。
                    </p>

                    <div className="grid md:grid-cols-2 gap-6 mt-4">
                      <div>
                        <h3 className="font-semibold text-text-primary mb-3 flex items-center">
                          <Factory className="h-4 w-4 mr-2 text-amber-600" />
                          サプライチェーン管理
                        </h3>
                        <ul className="space-y-2">
                          <li>• 環境配慮型サプライヤーの優先選定</li>
                          <li>• 調達先における労働環境の監査</li>
                          <li>• 地域内サプライヤーとの協力関係構築</li>
                          <li>• 公平な取引関係の維持と透明性確保</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold text-text-primary mb-3 flex items-center">
                          <Target className="h-4 w-4 mr-2 text-amber-600" />
                          SDGsへの貢献
                        </h3>
                        <ul className="space-y-2">
                          <li>• 目標3：良好な健康と福祉（職場環境改善）</li>
                          <li>• 目標5：ジェンダー平等（女性活躍推進）</li>
                          <li>• 目標8：働きがい経済成長（雇用創出）</li>
                          <li>• 目標12：つくる責任つかう責任（資源循環）</li>
                          <li>• 目標13：気候変動対策（CO2削減）</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4">
                      <p className="text-sm">
                        <strong>持続可能性目標：</strong>2050年までにカーボンニュートラル達成、100%再生可能エネルギー化、サーキュラー経済の完全実現を目指します。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. Ethical Management */}
            <section className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-border-medium">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                  <Handshake className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-text-primary mb-4">5. 倫理的経営ガイドライン</h2>
                  <div className="space-y-4 text-text-secondary leading-relaxed">
                    <p>
                      高い倫理基準を維持し、法令遵守と透明性の高い経営を通じて、全てのステークホルダーからの信頼を得ることを目指します。
                    </p>

                    <div className="grid md:grid-cols-2 gap-6 mt-4">
                      <div>
                        <h3 className="font-semibold text-text-primary mb-3 flex items-center">
                          <Shield className="h-4 w-4 mr-2 text-red-600" />
                          コンプライアンス体制
                        </h3>
                        <ul className="space-y-2">
                          <li>• コンプライアンス委員会の設置と定期開催</li>
                          <li>• 全従業員への法令遵守研修の実施</li>
                          <li>• 内部通報制度の設置と運用</li>
                          <li>• 不正行為防止規程の整備と徹底</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold text-text-primary mb-3 flex items-center">
                          <Heart className="h-4 w-4 mr-2 text-red-600" />
                          人権と労働環境
                        </h3>
                        <ul className="space-y-2">
                          <li>• ILO労働基準の遵守</li>
                          <li>• 児童労働と強制労働の完全排除</li>
                          <li>• 差別のない雇用機会の平等提供</li>
                          <li>• 安全で健康的な労働環境の維持</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mt-4">
                      <p className="text-sm">
                        <strong>倫理方針：</strong>「企業倫理の徹底を通じて、社会の持続可能な発展に貢献する」を基本理念とし、全従業員が倫理的行動規範を遵守します。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* CSR Performance Metrics */}
            <section className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-border-medium">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-text-primary mb-4">CSR実績と目標</h2>
                  <div className="space-y-4 text-text-secondary leading-relaxed">
                    <p>
                      CSR活動の成果を定期的に測定・評価し、継続的な改善に取り組んでいます。
                    </p>

                    <div className="grid md:grid-cols-3 gap-6 mt-4">
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                        <h3 className="font-semibold text-text-primary mb-2">環境指標</h3>
                        <ul className="space-y-1 text-sm">
                          <li>CO2排出量：年間5%削減達成</li>
                          <li>廃棄物リサイクル率：95%達成</li>
                          <li>水使用量：年間3%削減</li>
                          <li>再生可能エネルギー利用率：30%</li>
                        </ul>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                        <h3 className="font-semibold text-text-primary mb-2">社会指標</h3>
                        <ul className="space-y-1 text-sm">
                          <li>従業員満足度：88点（100点満点）</li>
                          <li>女性管理職比率：25%</li>
                          <li>従業員研修時間：年間40時間</li>
                          <li>地域貢献時間：年間800時間</li>
                        </ul>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                        <h3 className="font-semibold text-text-primary mb-2">ガバナンス指標</h3>
                        <ul className="space-y-1 text-sm">
                          <li>コンプライアンス遵守率：100%</li>
                          <li>内部通報処理件数：0件</li>
                          <li>倫理研修受講率：100%</li>
                          <li>サプライヤー監査実施率：100%</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 mt-4">
                      <p className="text-sm">
                        <strong>外部評価：</strong>GRIスタンダードに基づいたサステナビリティ報告書を年次で発行し、第三者機関による保証を受けています。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Future Commitments */}
            <section className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-border-medium">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center">
                  <Globe className="h-5 w-5 text-teal-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-text-primary mb-4">今後の取り組み</h2>
                  <div className="space-y-4 text-text-secondary leading-relaxed">
                    <p>
                      社会の変化とニーズに対応し、継続的なCSR活動の高度化に取り組んでいきます。
                    </p>

                    <div className="grid md:grid-cols-2 gap-6 mt-4">
                      <div>
                        <h3 className="font-semibold text-text-primary mb-3">中期目標（2025年まで）</h3>
                        <ul className="space-y-2">
                          <li>• サプライチェーン全体でのカーボンフットプリント算定</li>
                          <li>• 環境配慮型製品の売上比率50%達成</li>
                          <li>• 地域社会との共同プロジェクト10件実施</li>
                          <li>• 全従業員のSDGs研修100%達成</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold text-text-primary mb-3">長期目標（2030年まで）</h3>
                        <ul className="space-y-2">
                          <li>• カーボンニュートラルの達成</li>
                          <li>• 100%再生可能エネルギー使用</li>
                          <li>• サーキュラー経営の完全実現</li>
                          <li>• 業界をリードするCSR基準の確立</li>
                        </ul>
                      </div>
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
                  本CSR活動報告は、事業活動の実績や社会のニーズの変化に応じて、年次で更新いたします。
                </p>
                <div className="mt-4 flex justify-center space-x-6 text-sm">
                  <a href="mailto:csr@epackage-lab.com" className="text-brixa-600 hover:text-brixa-700 transition-colors">
                    CSRに関するお問い合わせ
                  </a>
                  <a href="/privacy" className="text-brixa-600 hover:text-brixa-700 transition-colors">
                    個人情報保護方針
                  </a>
                </div>
              </div>
            </section>
          </div>
        </div>
      </Container>
    </div>
  )
}