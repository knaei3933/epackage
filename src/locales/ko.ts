import type { TranslationKeys } from '@/lib/i18n'

export const koTranslations: TranslationKeys = {
  nav: {
    home: '홈',
    about: '회사 소개',
    services: '서비스',
    pricing: '가격 플랜',
    contact: '문의하기',
    login: '로그인',
    signup: '회원가입',
    dashboard: '대시보드',
  },

  header: {
    tagline: '첨단 패키징 솔루션',
    description: '혁신적인 포장 기술로 비즈니스 가능성을 확장하세요',
    cta: '무료 상담 시작하기',
    languageSelect: '언어 선택',
    mobileMenu: '메뉴',
    closeMenu: '닫기',
  },

  footer: {
    company: '회사',
    aboutUs: '회사 소개',
    ourServices: '서비스 안내',
    contactInfo: '연락 정보',
    followUs: '팔로우하기',
    newsletter: '뉴스레터',
    subscribe: '구독하기',
    emailPlaceholder: '이메일을 입력하세요',
    copyright: '모든 권리 보유',
    allRightsReserved: '모든 권리 보유',
    privacyPolicy: '개인정보처리방침',
    termsOfService: '이용약관',
    address: '주소',
    phone: '전화번호',
    email: '이메일',
    businessHours: '영업시간',
    hours: '월요일~금요일 9:00-18:00',
  },

  common: {
    loading: '로딩 중...',
    error: '오류',
    retry: '다시 시도',
    close: '닫기',
    cancel: '취소',
    confirm: '확인',
    save: '저장',
    delete: '삭제',
    edit: '편집',
    view: '보기',
    search: '검색',
    searchPlaceholder: '검색어를 입력하세요',
    filter: '필터',
    sort: '정렬',
    more: '더보기',
    less: '접기',
    next: '다음',
    previous: '이전',
    page: '페이지',
    of: '/',
    results: '개의 결과',
    noResults: '결과를 찾을 수 없습니다',
    select: '선택',
    selected: '선택됨',
    yes: '예',
    no: '아니오',
    ok: '확인',
    success: '성공',
    warning: '경고',
    info: '정보',
    reset: '재설정',
  },

  errors: {
    pageNotFound: '페이지를 찾을 수 없습니다',
    serverError: '서버 오류가 발생했습니다',
    networkError: '네트워크 오류가 발생했습니다',
    validationError: '입력 내용을 확인해주세요',
    unauthorized: '인증이 필요합니다',
    forbidden: '접근 권한이 없습니다',
    unknownError: '알 수 없는 오류가 발생했습니다',
    tryAgain: '다시 시도해주세요',
    goHome: '홈으로 이동',
  },

  loading: {
    initializing: '초기화 중...',
    processing: '처리 중...',
    saving: '저장 중...',
    deleting: '삭제 중...',
    updating: '업데이트 중...',
    loadingData: '데이터를 불러오는 중...',
    pleaseWait: '잠시만 기다려주세요...',
  },

  catalog: {
    title: '제품 카탈로그',
    subtitle: '최첨단 포장 솔루션으로 비즈니스를 다음 단계로 끌어올리세요',
    searchPlaceholder: '제품명, 재질, 용도로 검색...',
    categoryFilter: '카테고리로 필터링',
    allCategories: '모든 카테고리',
    sortBy: '정렬',
    sortByRelevance: '관련도순',
    sortByPrice: '가격순',
    sortByPopularity: '인기순',
    packageTypes: {
      standard: '표준',
      premium: '프리미엄',
      eco: '친환경',
      luxury: '럭셔리',
      industrial: '산업용',
      custom: '커스텀'
    },
    category: {
      type: '종류',
      material: '재질',
      size: '크기',
      industry: '산업'
    },
    actions: {
      viewDetails: '상세보기',
      requestSample: '샘플 요청',
      addToQuotation: '견적에 추가',
      contactUs: '문의하기'
    },
    details: {
      specifications: '사양',
      materials: '재질',
      dimensions: '치수',
      features: '특징',
      applications: '적용 분야',
      leadTime: '리드타임',
      minOrder: '최소 주문량',
      price: '가격'
    },
    modal: {
      close: '닫기',
      previousImage: '이전 이미지',
      nextImage: '다음 이미지',
      imageOf: '/',
      inquireAbout: '이 제품에 대해 문의하기'
    }
  }
}