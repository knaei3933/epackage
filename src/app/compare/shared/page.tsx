import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Shared Comparison | Epackage Lab",
  description: "View shared product comparisons from Epackage Lab"
}

export default function SharedComparisonPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Shared Comparison
        </h1>
        <p className="text-gray-600 mb-6">
          This page is currently under maintenance.
        </p>
        <a
          href="/compare"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Back to Compare
        </a>
      </div>
    </div>
  )
}
