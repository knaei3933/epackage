'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { CheckCircle, FileText, Award, Zap } from 'lucide-react'

interface TechnicalSpecsSectionProps {
  industry: string
}

export function TechnicalSpecsSection({ industry }: TechnicalSpecsSectionProps) {
  const technicalSpecs = {
    'food-manufacturing': {
      materials: [
        '食品接触用PE（ポリエチレン）',
        '食品接触用PP（ポリプロピレン）',
        'アルミ箔複合材',
        '抗菌性樹脂',
        '食品衛生法適合素材'
      ],
      certifications: [
        '食品衛生法適合',
        'FDA認証',
        'EU食品接触物質規則',
        'HACCP認証',
        'ISO 22000'
      ],
      features: [
        'マイクロ波対応',
        '冷凍耐性（-40℃）',
        '熱シール性',
        '印刷対応',
        '透明ウィンドウ対応'
      ],
      standards: [
        '食品衛生法第11条',
        '食品、添加物等の規格基準',
        '容器包装リサイクル法',
        'PL法（製品責任法）'
      ]
    },
    'cosmetics': {
      materials: [
        '高級感ラミネート',
        '金属蒸着フィルム',
        '環境対応バイオ素材',
        '特殊印刷用コート材',
        '芳香性素材'
      ],
      certifications: [
        'ISO 22716（GMPC）',
        'EC 1223/2009',
        'Cosmetic Europe',
        '厚生労働省認証',
        'Vegan認証'
      ],
      features: [
        'エンボス加工',
        '特殊効果印刷',
        'ミラー仕上げ',
        '開封確認シール',
        'サンプル対応'
      ],
      standards: [
        '化粧品規制',
        '包装リサイクル',
        '表示基準',
        '安全性基準',
        '品質管理基準'
      ]
    },
    'pharmaceutical': {
      materials: [
        '医療用PP',
        'アルミ箔複合材',
        '遮光フィルム',
        '無菌包装材',
        'デシカント封入材'
      ],
      certifications: [
        'PIC/S GMP',
        'ISO 15378',
        '医療機器製造管理基準',
        '厚生労働省認可',
        'FDA認証'
      ],
      features: [
        '小児安全キャップ',
        '防偽機能',
        '遮光性（99%以上）',
        '温湿度指示',
        'バーコード対応'
      ],
      standards: [
        '薬機法',
        'GMP基準',
        '医療用ラベリング',
        '安定性試験',
        '保管条件基準'
      ]
    },
    'electronics': {
      materials: [
        '導電性ポリマー',
        '炭素ナノチューブ複合材',
        '金属蒸着フィルム',
        '静電散乱材料',
        '衝撃吸発泡材'
      ],
      certifications: [
        'ESD S20.20',
        'IEC 61340-5',
        'MIL-STD-810',
        'IPC-CC-830',
        'RoHS対応'
      ],
      features: [
        'ESD防止（10^6〜10^9Ω）',
        '落下20G耐性',
        '温湿度管理',
        '自動化対応',
        'トレーサビリティ'
      ],
      standards: [
        '静電気放電防止',
        '輸送試験方法',
        '環境耐久性',
        '品質管理',
        '安全規格'
      ]
    }
  }

  const specs = technicalSpecs[industry as keyof typeof technicalSpecs] || technicalSpecs['food-manufacturing']

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <FileText className="w-8 h-8 text-navy-700" />
        <h3 className="text-2xl font-bold text-gray-900">技術仕様・認証</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Materials */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-navy-700" />
              <span>使用材料</span>
            </CardTitle>
            <CardDescription>各業界に適した専門素材を使用</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {specs.materials.map((material, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-navy-600" />
                  <span className="text-sm text-gray-700">{material}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Certifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-green-600" />
              <span>認証・規格</span>
            </CardTitle>
            <CardDescription>国内外の主要規格を取得</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {specs.certifications.map((cert, index) => (
                <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                  {cert}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-purple-600" />
              <span>特徴機能</span>
            </CardTitle>
            <CardDescription>独自の機能を実装</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {specs.features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Standards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-brixa-700" />
              <span>適合基準</span>
            </CardTitle>
            <CardDescription>関連法規と業界基準</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {specs.standards.map((standard, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-brixa-600" />
                  <span className="text-sm text-gray-700">{standard}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Quality Assurance */}
      <Card className="bg-navy-50 border-navy-600">
        <CardHeader>
          <CardTitle className="text-navy-600">品質保証体制</CardTitle>
          <CardDescription>全工程にわたる品質管理システム</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2 text-navy-600">品質管理</h4>
              <ul className="text-sm space-y-1 text-navy-600">
                <li>• 食品安全規格対応</li>
                <li>• 製品設計管理（PDCA）</li>
                <li>• 危害分析（HACCP）</li>
                <li>• リスクアセスメント</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-navy-600">検査体制</h4>
              <ul className="text-sm space-y-1 text-navy-600">
                <li>• 材料検査（入荷時）</li>
                <li>• 工程検査（製造時）</li>
                <li>• 完成品検査（出荷時）</li>
                <li>• 定期検査（月次）</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-navy-600">改善活動</h4>
              <ul className="text-sm space-y-1 text-navy-600">
                <li>• 継続的改善活動</li>
                <li>• 顧客フィードバック</li>
                <li>• 品質目標設定・管理</li>
                <li>• 内部監査実施</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}