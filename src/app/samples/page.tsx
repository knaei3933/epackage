import { Metadata } from 'next'
import SampleRequestFormWrapper from './SampleRequestFormWrapper'
import MemberSampleConfirmation from './MemberSampleConfirmation'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { createClient } from '@/lib/supabase/server'
import { loadSamplePrefill } from '@/lib/member/sample-prefill'
import { redirect } from 'next/navigation'

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

    return <MemberSampleConfirmation confirmation={prefill.data.confirmation} profileKana={prefill.data.profileKana} />;
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
