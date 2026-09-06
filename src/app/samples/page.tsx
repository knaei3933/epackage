import { Metadata } from 'next'
import SampleRequestFormWrapper from './SampleRequestFormWrapper'
import MemberSampleConfirmation from './MemberSampleConfirmation'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { createClient } from '@/lib/supabase/server'
import { loadSamplePrefill } from '@/lib/member/sample-prefill'
import { redirect } from 'next/navigation'
import { CheckCircle2, Clock, Package, Phone, ShieldCheck } from 'lucide-react'
import { Card } from '@/components/ui'

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
      <div className="min-h-screen bg-gradient-to-b from-brixa-50 via-white to-gray-50">
        <BreadcrumbJsonLd pathname="/samples" />

        <section className="bg-gradient-to-br from-brixa-600 via-brixa-700 to-navy-800 py-10">
          <div className="mx-auto max-w-6xl px-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brixa-100">
              MEMBER SAMPLE
            </p>
            <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">
              サンプル依頼の確認
            </h1>
            <p className="mt-3 text-brixa-100">
              登録情報を読み込みました。お届け先を確認して依頼を完了してください。
            </p>
          </div>
        </section>

        <main className="mx-auto max-w-6xl px-4 py-10">
          <ol className="mb-8 grid gap-3 sm:grid-cols-2" aria-label="申込手順">
            <li className="flex items-center gap-3 rounded-2xl border border-brixa-200 bg-white px-5 py-4 shadow-sm">
              <span className="flex size-9 items-center justify-center rounded-full bg-brixa-600 text-sm font-bold text-white">1</span>
              <div>
                <p className="text-sm font-bold text-gray-900">会員情報の確認</p>
                <p className="text-xs text-gray-600">お届け先を確認・編集</p>
              </div>
            </li>
            <li className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white/60 px-5 py-4 text-gray-500">
              <span className="flex size-9 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-500">2</span>
              <div>
                <p className="text-sm font-semibold">依頼完了</p>
                <p className="text-xs">ラベル印字と発送準備へ</p>
              </div>
            </li>
          </ol>

          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
            <Card className="rounded-3xl border-white/70 p-6 shadow-xl shadow-brixa-900/5 md:p-8">
              <MemberSampleConfirmation confirmation={prefill.data.confirmation} />
            </Card>

            <aside className="space-y-6 lg:sticky lg:top-6">
              <Card className="overflow-hidden rounded-3xl border-0 shadow-xl">
                <div className="bg-gradient-to-br from-brixa-600 to-navy-800 p-5 text-white">
                  <Package className="size-8" />
                  <h2 className="mt-3 text-lg font-bold">パウチサンプルセット</h2>
                  <p className="text-sm text-brixa-100">内容は固定の1点です</p>
                </div>
                <div className="space-y-4 p-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-600" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">完全無料</p>
                      <p className="text-xs text-gray-600">サンプル・送料ともに0円</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 size-5 shrink-0 text-brixa-600" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">2-3営業日</p>
                      <p className="text-xs text-gray-600">発送準備後に連絡します</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 size-5 shrink-0 text-green-600" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">追跡あり</p>
                      <p className="text-xs text-gray-600">発送後にお知らせします</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="rounded-3xl p-5">
                <h3 className="text-sm font-bold text-gray-900">ご質問・ご相談</h3>
                <p className="mt-2 text-xs text-gray-600">
                  サンプルに関するご質問は下記までお気軽にご連絡ください。
                </p>
                <div className="mt-4 space-y-3 text-sm text-gray-700">
                  <a href="mailto:info@package-lab.com" className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-3 transition-colors hover:bg-gray-100">
                    <Phone className="size-4 text-brixa-600" />
                    info@package-lab.com
                  </a>
                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-3">
                    <Clock className="size-4 text-brixa-600" />
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
    <div className="min-h-screen bg-gray-50">
      <BreadcrumbJsonLd pathname="/samples" />
      {/* Hero */}
      <section className="bg-gradient-to-br from-brixa-600 via-brixa-700 to-navy-800 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            パウチサンプルご依頼
          </h1>
          <p className="text-lg text-brixa-100 mb-6">
            無料でパウチセットサンプルをお送りいたします
          </p>
          <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <span className="text-green-400 font-semibold">完全無料</span>
            <span className="text-white/50 mx-2">|</span>
            <span className="text-brixa-100">全国送料無料</span>
          </div>
        </div>
      </section>

      {/* Sample Info */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gradient-to-r from-brixa-50 to-blue-50 rounded-xl p-8 border border-brixa-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              パウチセットサンプルについて
            </h2>
            <p className="text-gray-700 text-center mb-6">
              当社のパウチ製品セットを無料でお送りします。<br />
              実際の品質や素材をお手元でご確認いただけます。
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-3xl mb-2">📦</div>
                <p className="font-semibold text-gray-900">セットサンプル</p>
                <p className="text-sm text-gray-600">複数種類のパウチ</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-3xl mb-2">🎁</div>
                <p className="font-semibold text-gray-900">完全無料</p>
                <p className="text-sm text-gray-600">料金は一切かかりません</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-3xl mb-2">🚚</div>
                <p className="font-semibold text-gray-900">全国発送</p>
                <p className="text-sm text-gray-600">2〜3営業日でお届け</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Form */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              お申し込みフォーム
            </h2>

            <SampleRequestFormWrapper />
          </div>
        </div>
      </section>
    </div>
  )
}

export default async function SamplesPage() {
  return await SamplesPageContent()
}

export const dynamic = 'force-dynamic'
