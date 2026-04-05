// API 테스트 - CRUD 작업
// Epackage Lab 데이터베이스 API 테스트 파일

import { supabase, supabaseUtils } from './supabase'
import type {
  Contact,
  CreateContactRequest,
  CreateQuotationRequestRequest,
  CreateSampleRequestRequest,
  CreateInquiryRequest,
  QueryParams
} from '../types/database'

// =============================================================================
// Contacts API
// =============================================================================

// 연락처 생성
export const createContact = async (data: CreateContactRequest) => {
  try {
    const { data: result, error } = await supabase
      .from('contacts')
      .insert([data])
      .select()
      .single()

    if (error) {
      throw new Error(supabaseUtils.handleSupabaseError(error))
    }

    return { data: result, error: null }
  } catch (error) {
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : '알 수 없는 오류'
      }
    }
  }
}

// 연락처 목록 조회
export const getContacts = async (params: QueryParams = {}) => {
  try {
    const { page = 1, limit = 10, select = '*', ...filters } = params
    const { from, to } = supabaseUtils.getPagination(page, limit)

    let query = supabase
      .from('contacts')
      .select(select, { count: 'exact' })
      .range(from, to)

    // 검색 필터 적용
    if (filters.search) {
      query = query.or(supabaseUtils.buildSearchQuery(filters.search, ['name', 'company', 'email', 'phone']))
    }

    // 정렬 적용
    if (filters.column) {
      query = query.order(filters.column, { ascending: filters.ascending ?? true })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const { data, error, count } = await query

    if (error) {
      throw new Error(supabaseUtils.handleSupabaseError(error))
    }

    return {
      data: data ?? [],
      error: null,
      count: count ?? 0,
      hasMore: count ? from + limit < count : false,
      page,
      limit
    }
  } catch (error) {
    return {
      data: [],
      error: {
        message: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      count: 0,
      hasMore: false,
      page: 1,
      limit: 10
    }
  }
}

// 연락처 상세 조회
export const getContact = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(supabaseUtils.handleSupabaseError(error))
    }

    return { data, error: null }
  } catch (error) {
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : '알 수 없는 오류'
      }
    }
  }
}

// 연락처 수정
export const updateContact = async (id: string, data: Partial<Contact>) => {
  try {
    const { data: result, error } = await supabase
      .from('contacts')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(supabaseUtils.handleSupabaseError(error))
    }

    return { data: result, error: null }
  } catch (error) {
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : '알 수 없는 오류'
      }
    }
  }
}

// 연락처 삭제
export const deleteContact = async (id: string) => {
  try {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(supabaseUtils.handleSupabaseError(error))
    }

    return { data: true, error: null }
  } catch (error) {
    return {
      data: false,
      error: {
        message: error instanceof Error ? error.message : '알 수 없는 오류'
      }
    }
  }
}

// =============================================================================
// Quotation Requests API
// =============================================================================

// 견적 요청 생성
export const createQuotationRequest = async (data: CreateQuotationRequestRequest) => {
  try {
    // 트랜잭션 처리를 위해 RPC 함수 사용 권장
    // 여기서는 단순화된 버전으로 구현
    const { data: quotationData, error: quotationError } = await supabase
      .from('quotation_requests')
      .insert({
        contact_id: data.contact_id,
        company: data.company,
        contact_person: data.contact_person,
        email: data.email,
        phone: data.phone,
        project_description: data.project_description,
        requirements: data.requirements,
        budget_range: data.budget_range,
        timeline: data.timeline,
        priority: data.priority,
        estimated_delivery_date: data.estimated_delivery_date
      })
      .select()
      .single()

    if (quotationError) {
      throw new Error(supabaseUtils.handleSupabaseError(quotationError))
    }

    // 제품 정보가 있는 경우 추가
    if (data.products && data.products.length > 0) {
      const productsData = data.products.map(product => ({
        quotation_request_id: quotationData.id,
        product_id: product.product_id,
        quantity: product.quantity,
        unit_price: product.unit_price,
        notes: product.notes
      }))

      const { error: productsError } = await supabase
        .from('quotation_request_products')
        .insert(productsData)

      if (productsError) {
        throw new Error(supabaseUtils.handleSupabaseError(productsError))
      }
    }

    return { data: quotationData, error: null }
  } catch (error) {
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : '알 수 없는 오류'
      }
    }
  }
}

// 견적 요청 목록 조회
export const getQuotationRequests = async (params: QueryParams = {}) => {
  try {
    const { page = 1, limit = 10, select: _select, ...filters } = params  
    const { from, to } = supabaseUtils.getPagination(page, limit)

    let query = supabase
      .from('quotation_requests')
      .select(`
        *,
        contacts:contact_id (
          id,
          name,
          company,
          email,
          phone
        ),
        quotation_request_products (
          id,
          product_id,
          quantity,
          unit_price,
          total_price,
          notes,
          products:product_id (
            id,
            name,
            category,
            unit_price
          )
        )
      `, { count: 'exact' })
      .range(from, to)

    // 필터 적용
    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.priority) {
      query = query.eq('priority', filters.priority)
    }

    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from)
    }

    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to)
    }

    if (filters.search) {
      query = query.or(supabaseUtils.buildSearchQuery(filters.search, [
        'contact_person', 'email', 'company', 'project_description'
      ]))
    }

    // 정렬 적용
    if (filters.column) {
      query = query.order(filters.column, { ascending: filters.ascending ?? true })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const { data, error, count } = await query

    if (error) {
      throw new Error(supabaseUtils.handleSupabaseError(error))
    }

    return {
      data: data ?? [],
      error: null,
      count: count ?? 0,
      hasMore: count ? from + limit < count : false,
      page,
      limit
    }
  } catch (error) {
    return {
      data: [],
      error: {
        message: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      count: 0,
      hasMore: false,
      page: 1,
      limit: 10
    }
  }
}

// 견적 요청 상태 변경
export const updateQuotationRequestStatus = async (id: string, status: string) => {
  try {
    const { data, error } = await supabase
      .from('quotation_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(supabaseUtils.handleSupabaseError(error))
    }

    return { data, error: null }
  } catch (error) {
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : '알 수 없는 오류'
      }
    }
  }
}

// =============================================================================
// Sample Requests API
// =============================================================================

// 샘플 요청 생성
export const createSampleRequest = async (data: CreateSampleRequestRequest) => {
  try {
    const { data: result, error } = await supabase
      .from('sample_requests')
      .insert([data])
      .select()
      .single()

    if (error) {
      throw new Error(supabaseUtils.handleSupabaseError(error))
    }

    return { data: result, error: null }
  } catch (error) {
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : '알 수 없는 오류'
      }
    }
  }
}

// 샘플 요청 목록 조회
export const getSampleRequests = async (params: QueryParams = {}) => {
  try {
    const { page = 1, limit = 10, select: _select, ...filters } = params  
    const { from, to } = supabaseUtils.getPagination(page, limit)

    let query = supabase
      .from('sample_requests')
      .select(`
        *,
        contacts:contact_id (
          id,
          name,
          company,
          email,
          phone
        )
      `, { count: 'exact' })
      .range(from, to)

    // 필터 적용
    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.category) {
      query = query.eq('product_category', filters.category)
    }

    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from)
    }

    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to)
    }

    if (filters.search) {
      query = query.or(supabaseUtils.buildSearchQuery(filters.search, [
        'contact_person', 'email', 'company'
      ]))
    }

    // 정렬 적용
    if (filters.column) {
      query = query.order(filters.column, { ascending: filters.ascending ?? true })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const { data, error, count } = await query

    if (error) {
      throw new Error(supabaseUtils.handleSupabaseError(error))
    }

    return {
      data: data ?? [],
      error: null,
      count: count ?? 0,
      hasMore: count ? from + limit < count : false,
      page,
      limit
    }
  } catch (error) {
    return {
      data: [],
      error: {
        message: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      count: 0,
      hasMore: false,
      page: 1,
      limit: 10
    }
  }
}

// =============================================================================
// Inquiries API
// =============================================================================

// 문의 생성
export const createInquiry = async (data: CreateInquiryRequest) => {
  try {
    const { data: result, error } = await supabase
      .from('inquiries')
      .insert([data])
      .select()
      .single()

    if (error) {
      throw new Error(supabaseUtils.handleSupabaseError(error))
    }

    return { data: result, error: null }
  } catch (error) {
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : '알 수 없는 오류'
      }
    }
  }
}

// 문의 목록 조회
export const getInquiries = async (params: QueryParams = {}) => {
  try {
    const { page = 1, limit = 10, select: _select, ...filters } = params  
    const { from, to } = supabaseUtils.getPagination(page, limit)

    let query = supabase
      .from('inquiries')
      .select(`
        *,
        contacts:contact_id (
          id,
          name,
          company,
          email,
          phone
        ),
        inquiry_responses (
          id,
          response,
          responder_name,
          is_internal,
          created_at
        )
      `, { count: 'exact' })
      .range(from, to)

    // 필터 적용
    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.inquiry_type) {
      query = query.eq('inquiry_type', filters.inquiry_type)
    }

    if (filters.priority) {
      query = query.eq('priority', filters.priority)
    }

    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from)
    }

    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to)
    }

    if (filters.search) {
      query = query.or(supabaseUtils.buildSearchQuery(filters.search, [
        'name', 'email', 'company', 'subject', 'message'
      ]))
    }

    // 정렬 적용
    if (filters.column) {
      query = query.order(filters.column, { ascending: filters.ascending ?? true })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const { data, error, count } = await query

    if (error) {
      throw new Error(supabaseUtils.handleSupabaseError(error))
    }

    return {
      data: data ?? [],
      error: null,
      count: count ?? 0,
      hasMore: count ? from + limit < count : false,
      page,
      limit
    }
  } catch (error) {
    return {
      data: [],
      error: {
        message: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      count: 0,
      hasMore: false,
      page: 1,
      limit: 10
    }
  }
}

// 문의 답변 생성
export const createInquiryResponse = async (data: { inquiry_id: string, response: string, responder_name: string, is_internal?: boolean }) => {
  try {
    const { data: result, error } = await supabase
      .from('inquiry_responses')
      .insert([data])
      .select()
      .single()

    // 문의 상태를 'in_progress'로 변경
    if (!error) {
      await supabase
        .from('inquiries')
        .update({ status: 'in_progress' })
        .eq('id', data.inquiry_id)
    }

    if (error) {
      throw new Error(supabaseUtils.handleSupabaseError(error))
    }

    return { data: result, error: null }
  } catch (error) {
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : '알 수 없는 오류'
      }
    }
  }
}

// =============================================================================
// 통계 및 대시보드 API
// =============================================================================

// 대시보드 통계 조회
export const getDashboardStats = async () => {
  try {
    // RPC 함수를 사용하거나 개별 쿼리로 데이터 조회
    const [contactsResult, quotationsResult, samplesResult, inquiriesResult] = await Promise.all([
      supabase.from('contacts').select('id', { count: 'exact', head: true }),
      supabase.from('quotation_requests').select('id', { count: 'exact', head: true }),
      supabase.from('sample_requests').select('id', { count: 'exact', head: true }),
      supabase.from('inquiries').select('id', { count: 'exact', head: true })
    ])

    const [pendingQuotationsResult, pendingSamplesResult, newInquiriesResult] = await Promise.all([
      supabase.from('quotation_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('sample_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('inquiries').select('id', { count: 'exact', head: true }).eq('status', 'new')
    ])

    const stats = {
      total_contacts: contactsResult.count ?? 0,
      total_quotations: quotationsResult.count ?? 0,
      total_samples: samplesResult.count ?? 0,
      total_inquiries: inquiriesResult.count ?? 0,
      pending_quotations: pendingQuotationsResult.count ?? 0,
      pending_samples: pendingSamplesResult.count ?? 0,
      new_inquiries: newInquiriesResult.count ?? 0,
      completed_quotations: 0 // 추가 계산 필요
    }

    return { data: stats, error: null }
  } catch (error) {
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : '알 수 없는 오류'
      }
    }
  }
}

// =============================================================================
// 테스트 함수들
// =============================================================================

// API 테스트를 위한 통합 함수
export const runApiTests = async () => {
  console.log('🚀 시작: Epackage Lab API 테스트')

  try {
    // 1. 연락처 생성 테스트
    console.log('📝 테스트 1: 연락처 생성')
    const contactData = {
      name: '테스트 고객',
      company: '테스트 회사',
      email: 'test@example.com',
      phone: '010-1234-5678',
      position: '담당자',
      industry: '포장'
    }

    const contactResult = await createContact(contactData)
    if (contactResult.error) {
      throw new Error(`연락처 생성 실패: ${contactResult.error.message}`)
    }
    console.log('✅ 연락처 생성 성공:', contactResult.data?.id)

    // 2. 연락처 목록 조회 테스트
    console.log('📋 테스트 2: 연락처 목록 조회')
    const contactsResult = await getContacts({ limit: 5 })
    if (contactsResult.error) {
      throw new Error(`연락처 목록 조회 실패: ${contactsResult.error.message}`)
    }
    console.log('✅ 연락처 목록 조회 성공:', contactsResult.data.length, '개 항목')

    // 3. 문의 생성 테스트
    console.log('💬 테스트 3: 문의 생성')
    const inquiryData = {
      name: '테스트 문의자',
      email: 'inquiry@example.com',
      subject: '제품 문의',
      message: '포장 재료에 대해 문의드립니다.',
      inquiry_type: 'general' as const,
      priority: 'normal' as const
    }

    const inquiryResult = await createInquiry(inquiryData)
    if (inquiryResult.error) {
      throw new Error(`문의 생성 실패: ${inquiryResult.error.message}`)
    }
    console.log('✅ 문의 생성 성공:', inquiryResult.data?.id)

    // 4. 문의 목록 조회 테스트
    console.log('📋 테스트 4: 문의 목록 조회')
    const inquiriesResult = await getInquiries({ limit: 5 })
    if (inquiriesResult.error) {
      throw new Error(`문의 목록 조회 실패: ${inquiriesResult.error.message}`)
    }
    console.log('✅ 문의 목록 조회 성공:', inquiriesResult.data.length, '개 항목')

    // 5. 대시보드 통계 조회 테스트
    console.log('📊 테스트 5: 대시보드 통계 조회')
    const statsResult = await getDashboardStats()
    if (statsResult.error) {
      throw new Error(`통계 조회 실패: ${statsResult.error.message}`)
    }
    console.log('✅ 통계 조회 성공:', statsResult.data)

    console.log('🎉 모든 API 테스트 완료!')
    return { success: true, message: '모든 테스트가 성공적으로 완료되었습니다.' }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
    console.error('❌ API 테스트 실패:', errorMessage)
    return { success: false, message: errorMessage }
  }
}

// 데이터베이스 연결 테스트
export const testDatabaseConnection = async () => {
  console.log('🔍 데이터베이스 연결 테스트 시작')

  try {
    // Simple connection test by checking if we can access a table
    const { data: _data, error } = await supabase.from('contacts').select('id').limit(1)  

    if (error) {
      console.error('❌ 데이터베이스 연결 실패:', error)
      return { success: false, message: error.message || '데이터베이스 연결에 실패했습니다.' }
    }

    console.log('✅ 데이터베이스 연결 성공')
    return { success: true, message: '데이터베이스 연결이 정상입니다.' }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
    console.error('❌ 연결 테스트 중 오류:', errorMessage)
    return { success: false, message: errorMessage }
  }
}