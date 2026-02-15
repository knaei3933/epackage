import { Metadata } from "next";
import { ArchivePageClient } from "./ArchivePageClient";
import { sampleRecords } from "@/lib/archive-data";

// メタデータ生成 (SEO対策)
export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://example.com";
  const title = "パウチ導入実績・導入事例｜包装ソリューション";
  const description = "化粧品、食品、健康食品など様々な業界のパウチ包装導入事例をご紹介。スタンドパウチ、スパウトパウチ、BOX型パウチなどの実績多数。";
  const keywords = ["パウチ", "スタンドパウチ", "包装", "導入事例", "化粧品包装", "食品包装", "スパウトパウチ", "BOX型パウチ"];

  return {
    title,
    description,
    keywords,
    authors: [{ name: "包装ソリューションチーム" }],
    openGraph: {
      type: "website",
      locale: "ja_JP",
      url: `${baseUrl}/archives`,
      title,
      description,
      siteName: "包装ソリューション",
      images: [
        {
          url: `${baseUrl}/images/og-archives.png`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}/images/og-archives.png`],
    },
    alternates: {
      canonical: `${baseUrl}/archives`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

// 構造化データ (JSON-LD) 生成関数
function generateStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "パウチ導入実績・導入事例",
    description: "化粧品、食品、健康食品など様々な業界のパウチ包装導入事例をご紹介",
    url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://example.com"}/archives`,
    about: {
      "@type": "Thing",
      name: "パウチ包装",
      description: "様々な業界向けの包装ソリューション",
    },
    author: {
      "@type": "Organization",
      name: "包装ソリューションチーム",
    },
    hasPart: sampleRecords.map((record) => ({
      "@type": "Article",
      "@id": `${process.env.NEXT_PUBLIC_BASE_URL || "https://example.com"}/archives#${record.id}`,
      headline: record.title,
      description: record.description,
      datePublished: record.publishedAt || record.createdAt,
      dateModified: record.updatedAt,
      author: {
        "@type": record.author ? "Person" : "Organization",
        name: record.author?.name || "包装ソリューションチーム",
      },
      publisher: {
        "@type": "Organization",
        name: "包装ソリューションチーム",
        logo: {
          "@type": "ImageObject",
          url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://example.com"}/logo.png`,
        },
      },
      image: record.images.find(img => img.isMain)?.url || record.images[0]?.url,
      keywords: record.tags,
      articleSection: record.industry,
      about: {
        "@type": "Thing",
        name: record.clientName,
      },
    })),
  };

  return structuredData;
}

export default function ArchivePage() {
  const structuredData = generateStructuredData();

  return (
    <>
      {/* 構造化データ (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      <div className="min-h-screen bg-gray-50">
        <ArchivePageClient initialRecords={sampleRecords} />
      </div>
    </>
  );
}
