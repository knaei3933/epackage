/**
 * blurDataURL 생성 스크립트
 *
 * Next.js Image 컴넌트를 위한 blurDataURL을 생성합니다.
 * Sharp 라이브러리를 사용하여 작은 크기의 흐릿한 이미지를 생성하고 base64로 인코딩합니다.
 *
 * 사용법:
 * npm run generate:blurhashes
 */

import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { execSync } from 'child_process'
import sharp from 'sharp'

interface BlurHashResult {
  path: string
  blurDataURL: string
  width: number
  height: number
}

// 이미지 파일 확장자
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp']

// public 폴더 경로
const PUBLIC_DIR = join(process.cwd(), 'public')

// blurDataURL 생성 함수
async function generateBlurDataURL(imagePath: string): Promise<BlurHashResult | null> {
  try {
    // 절대 경로 변환
    const absolutePath = join(PUBLIC_DIR, imagePath)

    // 파일 존재 확인
    const { default: fs } = await import('fs')
    if (!fs.existsSync(absolutePath)) {
      console.warn(`이미지 파일이 존재하지 않습니다: ${imagePath}`)
      return null
    }

    // 이미지 메타데이터 읽기
    const metadata = await sharp(absolutePath).metadata()

    // 작은 크기로 이미지 처리 (10x10 픽셀)
    const resizeWidth = 10
    const resizeHeight = 10

    // 이미지 리사이즈 및 블러 처리
    const buffer = await sharp(absolutePath)
      .resize(resizeWidth, resizeHeight)
      .blur(0.5) // 가벼운 흐림 효과
      .toFormat('jpg', { quality: 30 }) // 낮은 품질의 JPG로 변환
      .toBuffer()

    // base64 인코딩
    const base64 = buffer.toString('base64')
    const blurDataURL = `data:image/jpeg;base64,${base64}`

    // 원본 이미지 크기
    const size = metadata.size

    return {
      path: imagePath,
      blurDataURL,
      width: resizeWidth,
      height: resizeHeight
    }
  } catch (error) {
    console.error(`blurDataURL 생성 실패: ${imagePath}`, error)
    return null
  }
}

// 모든 이미지 파일 검색 함수
async function findImageFiles(dir: string): Promise<string[]> {
  const { readdir, stat } = await import('fs/promises')
  const imageFiles: string[] = []

  async function searchDirectory(currentDir: string) {
    const entries = await readdir(currentDir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name)

      if (entry.isDirectory()) {
        // node_modules, .next 폴더 제외
        if (
          entry.name !== 'node_modules' &&
          entry.name !== '.next' &&
          !entry.name.startsWith('.')
        ) {
          await searchDirectory(fullPath)
        }
      } else if (entry.isFile()) {
        const ext = entry.name.split('.').pop()?.toLowerCase()
        if (ext && IMAGE_EXTENSIONS.includes(ext)) {
          // public 폴더 기준으로 경로 생성
          const relativePath = fullPath.replace(PUBLIC_DIR, '').replace(/\\/g, '/')
          if (relativePath.startsWith('/')) {
            imageFiles.push(relativePath)
          }
        }
      }
    }
  }

  await searchDirectory(dir)
  return imageFiles
}

async function main() {
  console.log('🖼️ blurDataURL 생성 시작...')
  console.log(`📁 대상 폴더: ${PUBLIC_DIR}`)

  // 모든 이미지 파일 검색
  console.log('🔍 이미지 파일 검색 중...')
  const imageFiles = await findImageFiles(join(PUBLIC_DIR, 'images'))

  console.log(`📝 찾은 이미지 파일: ${imageFiles.length}개`)

  if (imageFiles.length === 0) {
    console.log('⚠️  발견된 이미지가 없습니다.')
    return
  }

  // 이미지별 blurDataURL 생성
  const results: BlurHashResult[] = []

  for (const imagePath of imageFiles) {
    const result = await generateBlurDataURL(imagePath)
    if (result) {
      results.push(result)
      console.log(`✅ ${imagePath} - blurDataURL 생성 완료`)
    }
  }

  console.log(`\n📊 총 ${results.length}개 blurDataURL 생성 완료`)

  // 결과를 JSON 파일로 저장
  const outputDir = join(process.cwd(), 'src/lib')
  const outputFile = join(outputDir, 'blur-data.json')

  // 결과 매핑 생성 (이미지 경로 → blurDataURL)
  const blurDataMap: Record<string, string> = {}
  results.forEach(result => {
    // 경로에서 public/ 접두사 제거
    const key = result.path.replace(/^\//, '')
    blurDataMap[key] = result.blurDataURL
  })

  // 폴더 생성 및 파일 저장
  await mkdir(outputDir, { recursive: true })
  await writeFile(outputFile, JSON.stringify(blurDataMap, null, 2), 'utf-8')

  console.log(`💾 blurDataURL 매핑 저장: ${outputFile}`)
  console.log(`\n✨ 작업 완료!`)
}

main().catch(console.error)
