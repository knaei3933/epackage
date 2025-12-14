import ContactForm from '@/components/contact/ContactForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'パウチお問い合わせ | Epackage Lab',
  description: 'パウチ包装に関する専門的なご相談を受け付けています。ソフトパウチ、スタンドパウチなど6種類のパウチ製品に関するお問い合わせをどうぞ。',
  keywords: ['パウチお問い合わせ', '連包裝材', 'パウチ専門', '包装相談', 'Epackage Lab'],
  openGraph: {
    title: 'パウチお問い合わせ | Epackage Lab',
    description: 'パウチ包装専門のEpackage Labへのお問い合わせフォーム',
  },
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <ContactForm />
    </div>
  )
}