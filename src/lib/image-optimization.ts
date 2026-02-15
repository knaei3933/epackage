/**
 * Image Optimization Utilities
 *
 * blurDataURL 조회 및 이미지 최적화를 위한 유�리티 함수를 제공합니다.
 */

import blurDataMap from '@/lib/blur-data.json'

interface ImageBlurData {
  [key: string]: string
}

/**
 * 이미지 경로에 해당하는 blurDataURL을 반환합니다.
 *
 * @param imagePath - 이미지 경로 (예: "/images/products/pouch.jpg")
 * @returns blurDataURL 문자열 또는 빈 문자열
 */
export function getBlurDataURL(imagePath: string): string {
  // 경로에서 선행 슬래시 제거
  const normalizedPath = imagePath.replace(/^\//, '/').replace(/^\/+/, '/')

  // blurDataURL 매핑에서 조회
  return blurDataMap[normalizedPath] || ''
}

/**
 * 이미지가 blurDataURL을 가지고 있는지 확인합니다.
 *
 * @param imagePath - 이미지 경로
 * @returns blurDataURL 존재 여부
 */
export function hasBlurDataURL(imagePath: string): boolean {
  const normalizedPath = imagePath.replace(/^\//, '/').replace(/^\/+/, '/')
  return normalizedPath in blurDataMap
}

/**
 * Next.js Image 컴포넌트용 placeholder 설정을 생성합니다.
 *
 * @param imagePath - 이미지 경로
 * @returns blurDataURL 설정 객체
 */
export function createBlurPlaceholder(imagePath: string) {
  const blurDataURL = getBlurDataURL(imagePath)

  return {
    blurDataURL: blurDataURL || undefined,
    placeholder: blurDataURL ? 'blur' : 'empty',
  } as const
}
