import { Metadata } from 'next'
import SampleRequestFormWrapper from './SampleRequestFormWrapper'
import MemberSampleConfirmation from './MemberSampleConfirmation'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { createClient } from '@/lib/supabase/server'
import { loadSamplePrefill } from '@/lib/member/sample-prefill'
import { redirect } from 'next/navigation'
import { CheckCircle2, Clock, Gift, Package, Phone, ShieldCheck, Truck } from 'lucide-react'
import { Badge, Card } from '@/components/ui'
import { PageHeader } from '@/components/layout'

export const metadata: Metadata = {
  title: 'パウチサンプルご依頼',
  description: 'Epackage Labのパウチ製品サンプルを無料でお送りします。パウチセットサンプルでお手元でお試しいただけます。全国送料無料。',
  alternates: {
    canonical: 'https://www.package-lab.com/samples',
  },
  openGraph: {
    title: 'パウチサンプルご依頼',
    description: 'Epackage Labのパッキージ製品サンプルを無料でお送りします',
  },
}

async function SamplesPageContent() {
  type SamplesAuthentication =
    | { status: 'authenticated'; userId: string }
    | { status: 'no_session' }
    | { status: 'lookup_failed' }

  let authentication: SamplesAuthentication
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      authentication = { status: 'lookup_failed' }
    } else if (data.user?.id) {
      authentication = { status: 'authenticated', userId: data.user.id }
    } else {
      authentication = { status: 'no_session' }
    }
  } catch {
    authentication = { status: 'lookup_failed' }
  }

  if (authentication.status === 'lookup_failed') {
    console.warn('[SAMPLES] authentication lookup unavailable', {
      pathname: '/samples',
    })
    redirect('/auth/error?error=authentication_unavailable')
  }

  if (authentication.status === 'authenticated') {
    const supabase = await createClient();
    const prefill = await loadSamplePrefill(supabase, authentication.userId);

    if (prefill.status === 'profile_not_active') {
      if (prefill.profileStatus === 'PENDING') {
        redirect('/auth/pending');
      }
      if (prefill.profileStatus === 'SUSPENDED') {
        redirect('/auth/suspended');
      }
      redirect('/auth/signin?redirect=%2Fsamples');
    }

    if (prefill.status === 'profile_not_found') {
      redirect('/auth/signin?redirect=%2Fsamples');
    }

    // loadSamplePrefill logs query infrastructure failures with non-PII status
    // and correlation context; infrastructure remains fail-closed rather than
    // masquerading as profile completion work.
    if (prefill.status !== 'loaded') {
      redirect('/auth/error?error=sample_prefill_unavailable');
    }

    if (!prefill.complete) {
      redirect('/member/profile?complete=1&returnTo=%2Fsamples');
    }

    return (
      <div className="min-h-screen bg-bg-primary">
        <BreadcrumbJsonLd pathname="/samples" />

        <PageHeader
          title="サンプル依頼の確認"
          lead="登録情報を読み込みました。お届け先を確認して依頼を完了してください。"
        />

        <main className="mx-auto max-w-[1120px] px-4 py-12 sm:px-6 md:py-16">
          <ol className="mb-8 grid gap-4 sm:grid-cols-2" aria-label="申込手順">
            <li className="flex items-center gap-3 rounded-container border border-brand bg-brand-subtle px-5 py-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-brand text-sm font-bold text-on-brand">1</span>
              <div>
                <p className="text-sm font-bold text-text-primary">会員情報の確認</p>
                <p className="text-[13px] text-text-secondary">お届け先を確認・編集</p>
              </div>
            </li>
            <li className="flex items-center gap-3 rounded-container border border-border-medium bg-bg-primary px-5 py-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-bg-subtle text-sm font-bold text-text-secondary">2</span>
              <div>
                <p className="text-sm font-medium text-text-primary">依頼完了</p>
                <p className="text-[13px] text-text-secondary">ラベル印字と発送準備へ</p>
              </div>
            </li>
          </ol>

          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
            <Card className="p-6 md:p-8">
              <MemberSampleConfirmation confirmation={prefill.data.confirmation} />
            </Card>

            <aside className="space-y-6 lg:sticky lg:top-6">
              <Card className="overflow-hidden">
                <div className="border-b border-border-medium bg-bg-secondary p-5">
                  <Package className="size-8 text-brand" aria-hidden="true" />
                  <h2 className="mt-3 text-lg font-bold text-text-primary">パウチサンプルセット</h2>
                  <p className="text-sm text-text-secondary">内容は固定の1点です</p>
                </div>
                <div className="space-y-4 p-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-bold text-text-primary">完全無料</p>
                      <p className="text-[13px] text-text-secondary">サンプル・送料ともに0円</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-bold text-text-primary">2-3営業日</p>
                      <p className="text-[13px] text-text-secondary">発送準備後に連絡します</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-bold text-text-primary">追跡あり</p>
                      <p className="text-[13px] text-text-secondary">発送後にお知らせします</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-5">
                <h3 className="text-sm font-bold text-text-primary">ご質問・ご相談</h3>
                <p className="mt-2 text-[13px] leading-[1.8] text-text-secondary">
                  サンプルに関するご質問は下記までお気軽にご連絡ください。
                </p>
                <div className="mt-4 space-y-3 text-sm text-text-primary">
                  <a href="mailto:info@package-lab.com" className="flex min-h-11 items-center gap-3 rounded-md bg-bg-secondary px-3 py-3 transition-colors hover:bg-bg-subtle">
                    <Phone className="size-4 text-brand" aria-hidden="true" />
                    info@package-lab.com
                  </a>
                  <div className="flex items-center gap-3 rounded-md bg-bg-secondary px-3 py-3">
                    <Clock className="size-4 text-brand" aria-hidden="true" />
                    平日 9:00-18:00
                  </div>
                </div>
              </Card>
            </aside>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <BreadcrumbJsonLd pathname="/samples" />
      <PageHeader
        title="パウチサンプルご依頼"
        lead="無料でパウチセットサンプルをお送りいたします"
      >
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">完全無料</Badge>
          <Badge variant="default">全国送料無料</Badge>
        </div>
      </PageHeader>

      {/* Sample Info */}
      <section className="bg-bg-primary py-16 md:py-24">
        <div className="mx-auto max-w-[1120px] px-4 sm:px-6">
          <h2 className="font-heading text-2xl leading-[1.4] text-text-primary [word-break:keep-all] supports-[word-break:auto-phrase]:[word-break:auto-phrase] [overflow-wrap:anywhere] text-balance md:text-[2rem]">
            パウチセットサンプルについて
          </h2>
          <p className="mt-4 max-w-[40em] leading-[1.8] text-text-secondary">
            当社のパウチ製品セットを無料でお送りします。<br />
            実際の品質や素材をお手元でご確認いただけます。
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <Card className="p-6">
              <Package className="mb-3 size-8 text-brand" aria-hidden="true" />
              <p className="font-bold text-text-primary">セットサンプル</p>
              <p className="text-sm text-text-secondary">複数種類のパウチ</p>
            </Card>
            <Card className="p-6">
              <Gift className="mb-3 size-8 text-brand" aria-hidden="true" />
              <p className="font-bold text-text-primary">完全無料</p>
              <p className="text-sm text-text-secondary">料金は一切かかりません</p>
            </Card>
            <Card className="p-6">
              <Truck className="mb-3 size-8 text-brand" aria-hidden="true" />
              <p className="font-bold text-text-primary">全国発送</p>
              <p className="text-sm text-text-secondary">2〜3営業日でお届け</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Simple Form */}
      <section className="bg-bg-secondary py-16 md:py-24">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <Card className="p-6 md:p-8">
            <h2 className="mb-6 text-xl font-bold text-text-primary md:text-2xl">
              お申し込みフォーム
            </h2>

            <SampleRequestFormWrapper />
          </Card>
        </div>
      </section>
    </div>
  )
}

export default async function SamplesPage() {
  return await SamplesPageContent()
}

export const dynamic = 'force-dynamic'
