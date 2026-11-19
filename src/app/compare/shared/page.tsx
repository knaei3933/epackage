import { Metadata } from "next"
import Link from "next/link"
import { PageHeader } from "@/components/layout"
import { buttonVariants } from "@/components/ui/Button"

export const metadata: Metadata = {
  title: "Shared Comparison",
  description: "View shared product comparisons from Epackage Lab"
}

export default function SharedComparisonPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <PageHeader
        title="Shared Comparison"
        lead="This page is currently under maintenance."
        actions={
          <Link href="/compare" className={buttonVariants({ variant: "primary", size: "md" })}>
            Back to Compare
          </Link>
        }
      />
    </div>
  )
}
