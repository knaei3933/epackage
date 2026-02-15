// Supabase 클라이언트 설정
// Epackage Lab 프로젝트 데이터베이스 연결

import { createClient } from '@supabase/supabase-js'
// 임시로 Database 타입 제외 (나중에 Supabase 설정 후 복원)
// import type { Database } from '../types/database'

// 환경 변수에서 Supabase 설정 가져오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 환경 변수 유효성 검사
if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL 환경 변수가 설정되지 않았습니다.')
}

if (!supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY 환경 변수가 설정되지 않았습니다.')
}

// Supabase 클라이언트 생성 (임시로 타입 제외)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  // 클라이언트 옵션 설정
  auth: {
    // 세션 지속 시간 (초)
    persistSession: true,
    // 자동 리프레시 토큰
    autoRefreshToken: true,
    // 세션 저장 방식
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  // 실시time 옵션
  realtime: {
    // 실시간 구독 자동 연결
    params: {
      eventsPerSecond: 2,
    },
  },
  // 글로벌 헤더 설정
  global: {
    headers: {
      'X-Client-Info': 'epackage-lab-web',
    },
  },
})

// 서버 측에서 사용할 클라이언트 (Service Role Key 사용)
export const createSupabaseAdmin = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY 환경 변수가 설정되지 않았습니다.')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        'X-Client-Info': 'epackage-lab-web-admin',
      },
    },
  })
}

// 데이터베이스 연결 상태 확인
export const checkDatabaseConnection = async () => {
  try {
    const { data: _data, error } = await supabase // eslint-disable-line @typescript-eslint/no-unused-vars
      .from('contacts')
      .select('count')
      .limit(1)

    if (error) {
      console.error('데이터베이스 연결 실패:', error.message)
      return { connected: false, error: error.message }
    }

    return { connected: true, error: null }
  } catch (error) {
    console.error('데이터베이스 연결 확인 중 오류:', error)
    return {
      connected: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    }
  }
}

// 유틸리티 함수
export const supabaseUtils = {
  // 에러 처리
  handleSupabaseError: (error: { code?: string; message?: string }) => {
    console.error('Supabase Error:', error)

    if (error.code === 'PGRST301') {
      return '인증이 필요합니다. 다시 로그인해주세요.'
    }

    if (error.code === 'PGRST116') {
      return '요청한 데이터를 찾을 수 없습니다.'
    }

    if (error.code === '23505') {
      return '이미 존재하는 데이터입니다.'
    }

    if (error.code === '23514') {
      return '데이터 형식이 올바르지 않습니다.'
    }

    return error.message || '요청 처리 중 오류가 발생했습니다.'
  },

  // 페이지네이션
  getPagination: (page: number = 1, limit: number = 10) => {
    const from = (page - 1) * limit
    const to = from + limit - 1
    return { from, to }
  },

  // 날짜 필터링
  getDateFilter: (startDate?: string, endDate?: string) => {
    const filters: { gte?: string; lte?: string } = {}

    if (startDate) {
      filters.gte = startDate
    }

    if (endDate) {
      filters.lte = endDate
    }

    return Object.keys(filters).length > 0 ? filters : undefined
  },

  // 검색 쿼리 빌더
  buildSearchQuery: (searchTerm: string, columns: string[]) => {
    return columns.map(column => `${column}.ilike.%${searchTerm}%`).join(',')
  },
}

// 실시간 구독 헬퍼
export const createSubscription = (
  channel: string,
  event: 'INSERT' | 'UPDATE' | 'DELETE',
  table: string,
  callback: (payload: { new?: Record<string, unknown>; old?: Record<string, unknown> }) => void
) => {
  return supabase
    .channel(channel)
    .on(
      'postgres_changes' as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      {
        event,
        schema: 'public',
        table: table,
      },
      callback
    )
    .subscribe()
}

// 파일 업로드 헬퍼
export const uploadFile = async (
  bucket: string,
  path: string,
  file: File,
  options?: {
    upsert?: boolean
    cacheControl?: string
    metadata?: Record<string, string>
  }
) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
      ...options,
    })

  if (error) {
    throw new Error(`파일 업로드 실패: ${error.message}`)
  }

  return data
}

// 파일 다운로드 URL 생성
export const getPublicUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return data.publicUrl
}

// 파일 삭제
export const deleteFile = async (bucket: string, path: string) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  if (error) {
    throw new Error(`파일 삭제 실패: ${error.message}`)
  }

  return true
}

// 기본 내보내기
export default supabase