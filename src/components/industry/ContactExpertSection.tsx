'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { buttonVariants } from '@/components/ui/Button'
import { MessageCircle, Users, FileText, Award } from 'lucide-react'

interface ContactExpertSectionProps {
  industry: string
}

// 相談は /contact のフォームで受け付ける。
// このページには送信フォームを置かない（以前は送信されないのに「送信済み」と表示していた）。
export function ContactExpertSection({ industry }: ContactExpertSectionProps) {
  return (
    <div className="space-y-8" data-industry={industry}>
      <div className="flex items-center space-x-3">
        <Users className="w-8 h-8 text-brand" aria-hidden="true" />
        <h3 className="text-2xl font-bold text-text-primary">専門家へ相談</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>お問い合わせフォームからご相談ください</CardTitle>
            <CardDescription>
              ご相談はお問い合わせページで受け付けています。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-text-secondary">
              用途や数量、ご希望の仕様をお書きいただければ、担当者がご連絡します。
            </p>
            <Link href="/contact" className={buttonVariants({ size: 'lg', variant: 'primary' })}>
              <MessageCircle className="w-5 h-5 mr-2" aria-hidden="true" />
              お問い合わせページへ
            </Link>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">ご相談の例</CardTitle>
            <CardDescription>こんなことをご相談いただけます</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-3">
              <FileText className="w-5 h-5 text-brand mt-0.5" aria-hidden="true" />
              <div>
                <div className="font-medium text-text-primary">包装の技術相談</div>
                <div className="text-sm text-text-secondary">素材や形状の選び方</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Award className="w-5 h-5 text-brand mt-0.5" aria-hidden="true" />
              <div>
                <div className="font-medium text-text-primary">規格・仕様の確認</div>
                <div className="text-sm text-text-secondary">用途に合う仕様の確認</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Users className="w-5 h-5 text-brand mt-0.5" aria-hidden="true" />
              <div>
                <div className="font-medium text-text-primary">導入の進め方</div>
                <div className="text-sm text-text-secondary">サンプルから量産まで</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
