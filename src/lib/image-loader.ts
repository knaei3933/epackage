/**
 * Custom image loader to ensure www prefix for image optimization
 * This prevents redirect errors when package-lab.com (without www) is accessed
 */

export default function imageLoader({ src, width, quality }: {
  src: string
  width: number
  quality?: number
}) {
  // Ensure we use www.package-lab.com for all image requests
  const baseUrl = 'https://www.package-lab.com'

  // If src is already a full URL, return it as is
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src
  }

  // For Next.js image optimization
  return `${baseUrl}/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}`
}
