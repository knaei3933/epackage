# Brixa 마이페이지 구조 분석 보고서

## 분석 개요

- **분석 대상**: https://brixa.jp/mypage/senders (발송처 관리 페이지)
- **페이지 타이틀**: 発送元管理 | Brixa
- **분석 날짜**: 2025-12-27
- **로그인 정보**: kim@kanei-trade.co.jp / Ghkrdlsdyd1100
- **분석 방법**: Playwright 자동화 + HTML 구조 분석

---

## 1. 페이지 전체 구조

### 1.1 레이아웃 구조
```html
<div class="max-w-[1260px] mx-auto grid grid-cols-1 lg:grid-cols-[208px_1fr] gap-4 lg:gap-[72px] px-4 py-8">
  <!-- 사이드바 (PC용) -->
  <aside>...</aside>

  <!-- 메인 콘텐츠 영역 -->
  <div class="min-h-screen bg-white">...</div>
</div>
```

### 1.2 CSS 클래스명 주요 패턴
- **레이아웃**: `grid`, `grid-cols-1`, `lg:grid-cols-[208px_1fr]`, `gap-4`, `lg:gap-[72px]`
- **반응형**: `lg:`, `md:`, `sm:` 접두사 사용
- **색상**: `bg-white`, `bg-[#FAFAFC]`, `bg-[#F5F5F7]`
- **테두리**: `border`, `border-[#F5F5F7]`, `border-[#D9D9D9]`
- **간격**: `px-4`, `py-8`, `lg:gap-[72px]`

---

## 2. 헤더 구조 (Header)

### 2.1 헤더 HTML 구조
```html
<header class="z-50 flex h-[58px] w-full items-center justify-center border-b border-[#F5F5F7] bg-[#FAFAFC] transition-all">
  <div class="flex h-full w-full max-w-[1076px] items-center justify-end gap-6 px-10">
    <!-- 네비게이션 메뉴 -->
    <nav class="flex items-center gap-4">...</nav>

    <!-- 액션 버튼들 -->
    <div class="flex items-center gap-2">...</div>

    <!-- 사용자 정보 드롭다운 -->
    <div class="flex gap-2">...</div>
  </div>
</header>
```

### 2.2 헤더 주요 컴포넌트

#### 2.2.1 네비게이션 메뉴
```html
<nav class="flex items-center gap-4">
  <!-- 알림 (7개) -->
  <button class="relative flex h-[38px] w-12 flex-col items-center cursor-pointer">
    <svg>...</svg>
    <div class="absolute -right-[7px] -top-1 flex h-[14px] w-[14px] items-center justify-center rounded-full bg-[#FF3B30]">
      <span class="text-[10px] font-semibold text-white opacity-[0.99]">7</span>
    </div>
    <span class="mt-1 text-[10px] text-[#1D1D1F]">お知らせ</span>
  </button>

  <!-- 신규 주문 -->
  <a class="relative flex h-[38px] flex-col items-center" href="/mypage/orders/new">
    <svg>...</svg>
    <span class="mt-1 text-[10px] text-[#1D1D1F]">新規注文</span>
  </a>

  <!-- 재주문/주문이력 -->
  <a class="relative flex h-[38px] flex-col items-center" href="/mypage/orders/histories">
    <svg>...</svg>
    <span class="mt-1 text-[10px] text-[#1D1D1F] whitespace-nowrap">再注文/注文履歴</span>
  </a>

  <!-- 마이페이지 -->
  <a class="relative flex h-[38px] flex-col items-center" href="/mypage">
    <svg>...</svg>
    <span class="mt-1 text-[10px] text-[#1D1D1F] whitespace-nowrap">マイページ</span>
  </a>

  <!-- 견적 이력 -->
  <a class="relative flex h-[38px] flex-col items-center" href="/estimates">
    <div class="relative">
      <svg>...</svg>
    </div>
    <span class="mt-1 text-[10px] text-[#1D1D1F]">見積履歴</span>
  </a>
</nav>
```

#### 2.2.2 액션 버튼 그룹
```html
<div class="flex items-center gap-2">
  <!-- 스마트 견적 버튼 -->
  <a class="flex h-7 items-center gap-1.5 rounded-[100px] bg-gradient-to-r from-[#178AF7] via-[#6918F6] to-[#F65B18] px-6 py-2 hover:opacity-70">
    <svg>...</svg>
    <span class="text-xs font-medium text-white">スマート見積り</span>
  </a>

  <!-- 문의 버튼 -->
  <a class="flex h-7 items-center gap-1.5 rounded-[100px] bg-white px-6 py-2 hover:opacity-70 border border-[#007AFF]">
    <svg>...</svg>
    <span class="text-xs font-medium text-[#007AFF]">お問い合わせ</span>
  </a>
</div>
```

#### 2.2.3 사용자 정보 드롭다운
```html
<div class="flex gap-2">
  <div class="relative">
    <button class="flex h-7 items-center gap-2 rounded-2xl border border-[#1D1D1F] border-opacity-50 bg-white px-4 py-2">
      <div class="flex items-center gap-1.5">
        <svg>...</svg>
        <span class="text-xs font-medium text-[#1D1D1F]">金井貿易株式会社...</span>
      </div>
      <svg>...</svg>
    </button>
  </div>
</div>
```

---

## 3. 사이드바/네비게이션 구조

### 3.1 사이드바 HTML 구조
```html
<aside class="relative h-0 lg:h-auto w-64 lg:w-52 bg-white z-40 lg:z-auto transform transition-transform duration-300 ease-in-out -translate-x-[200%] lg:translate-x-0 lg:transform-none overflow-y-auto shadow-xl lg:shadow-none rounded-2xl lg:rounded-2xl">
  <div class="px-0 pb-4 pt-6 lg:pt-0">
    <!-- 사이드바 헤더 -->
    <div class="lg:hidden mb-6">
      <h2 class="text-lg font-bold text-gray-900 px-4">マイページメニュー</h2>
    </div>
    <h2 class="hidden lg:block text-xs font-medium text-gray-700 px-4 py-2 mb-3">マイページメニュー</h2>

    <!-- 네비게이션 메뉴 -->
    <nav class="space-y-1">...</nav>
  </div>
</aside>
```

### 3.2 메뉴 아이템 구조

#### 3.2.1 메인 메뉴
```html
<nav class="space-y-1">
  <!-- 마이페이지 메인 -->
  <a class="flex items-center gap-4 px-4 py-3 rounded-xl transition-colors cursor-pointer hover:bg-gray-50" href="/mypage">
    <svg class="w-6 h-6 text-gray-600">...</svg>
    <span class="text-sm font-medium text-gray-600">マイページトップ</span>
  </a>

  <!-- 주문 상태 -->
  <a class="flex items-center gap-4 px-4 py-3 rounded-xl transition-colors cursor-pointer hover:bg-gray-50" href="/mypage/orders">
    <svg class="w-6 h-6 text-gray-600">...</svg>
    <span class="text-sm font-medium text-gray-600">注文状況</span>
  </a>

  <!-- 신규 주문 -->
  <a class="flex items-center gap-4 px-4 py-3 rounded-xl transition-colors cursor-pointer hover:bg-gray-50" href="/mypage/orders/new">
    <svg class="w-6 h-6 text-gray-600">...</svg>
    <span class="text-sm font-medium text-gray-600">新規注文</span>
  </a>

  <!-- 재주문/주문이력 -->
  <a class="flex items-center gap-4 px-4 py-3 rounded-xl transition-colors cursor-pointer hover:bg-gray-50" href="/mypage/orders/histories">
    <svg class="w-6 h-6 text-gray-600">...</svg>
    <span class="text-sm font-medium text-gray-600">再注文・注文履歴</span>
  </a>

  <!-- 배송/청구 정보 (서브메뉴) -->
  <div>
    <button class="flex items-center gap-4 px-4 py-3 rounded-xl transition-colors cursor-pointer w-full text-left bg-[#007AFF]">
      <svg class="w-6 h-6 text-white">...</svg>
      <span class="text-sm font-medium text-white">納品・請求情報</span>
      <svg class="w-4 h-4 ml-auto transition-transform rotate-180 text-white">...</svg>
    </button>
    <div class="ml-8 mt-0 relative">
      <svg>...</svg>
      <div class="pl-8 space-y-8 py-5">
        <a class="block text-xs hover:text-[#007AFF] transition-colors text-[#CCCCCC]" href="/mypage/deliveries">納品先一覧</a>
        <a class="block text-xs hover:text-[#007AFF] transition-colors text-[#616161] font-bold" href="/mypage/senders">送り主一覧</a>
        <a class="block text-xs hover:text-[#007AFF] transition-colors text-[#CCCCCC]" href="/mypage/invoices">請求先一覧</a>
      </div>
    </div>
  </div>

  <!-- 회원 정보 -->
  <a class="flex items-center gap-4 px-4 py-3 rounded-xl transition-colors cursor-pointer hover:bg-gray-50" href="/mypage/edit">
    <svg class="w-6 h-6 text-gray-600">...</svg>
    <span class="text-sm font-medium text-gray-600">会員登録情報</span>
  </a>

  <!-- 로그아웃 -->
  <button class="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors w-full text-left cursor-pointer">
    <svg class="w-6 h-6 text-gray-600">...</svg>
    <span class="text-sm font-medium text-gray-600">ログアウト</span>
  </button>
</nav>
```

---

## 4. 메인 콘텐츠 구조

### 4.1 메인 영역 HTML 구조
```html
<div class="min-h-screen bg-white">
  <div class="max-w-[990px] mx-auto pb-20">
    <!-- 헤더 영역 -->
    <div class="flex justify-between items-start mb-8">
      <div class="flex justify-between w-full items-center">
        <!-- 정렬 및 검색 -->
        <div class="flex items-center gap-6">
          <!-- 정렬 드롭다운 -->
          <button class="flex items-center gap-2 px-6 py-3 border border-[#616161] rounded-full hover:bg-gray-50 transition-colors">
            <svg>...</svg>
            <span class="text-sm text-[#616161]">新しい順</span>
          </button>

          <!-- 검색창 -->
          <div class="relative">
            <input type="text" placeholder="キーワード検索" class="w-[298px] h-[46px] pl-12 pr-10 border border-[#D9D9D9] rounded-xl text-sm placeholder-[#CCCCCC] focus:outline-none focus:ring-2 focus:ring-[#007AFF]">
            <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#007AFF]">...</svg>
          </div>
        </div>

        <!-- 추가 버튼 -->
        <div class="flex justify-end items-center">
          <button class="flex items-center gap-2 px-8 py-3 border border-[#007AFF] text-[#007AFF] rounded-full hover:bg-blue-50 transition-colors cursor-pointer">
            <svg>...</svg>
            <span class="text-xs font-medium">発送元を追加</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 콘텐츠 영역 -->
    <div class="space-y-6">
      <!-- 내용 없음 메시지 -->
      <div class="text-center py-20">
        <p class="text-gray-500">発送元情報がありません</p>
      </div>
    </div>
  </div>
</div>
```

### 4.2 주요 기능 요소

#### 4.2.1 정렬 드롭다운
```html
<button class="flex items-center gap-2 px-6 py-3 border border-[#616161] rounded-full hover:bg-gray-50 transition-colors">
  <svg class="lucide lucide-chevron-down w-4 h-4 text-[#616161]">...</svg>
  <span class="text-sm text-[#616161]">新しい順</span>
</button>
```

#### 4.2.2 검색창
```html
<div class="relative">
  <input
    type="text"
    placeholder="キーワード検索"
    class="w-[298px] h-[46px] pl-12 pr-10 border border-[#D9D9D9] rounded-xl text-sm placeholder-[#CCCCCC] focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
    value=""
  >
  <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#007AFF] lucide lucide-search">...</svg>
</div>
```

#### 4.2.3 추가 버튼
```html
<button class="flex items-center gap-2 px-8 py-3 border border-[#007AFF] text-[#007AFF] rounded-full hover:bg-blue-50 transition-colors cursor-pointer">
  <svg class="lucide lucide-plus w-3.5 h-3.5">...</svg>
  <span class="text-xs font-medium">発送元を追加</span>
</button>
```

---

## 5. 상단 배너/알림 영역

### 5.1 배너 구조
```html
<div class="h-[46px] w-full">
  <div class="flex h-full w-full items-center justify-center bg-[#F5F5F7]" style="opacity: 1; transform: none;">
    <div class="flex w-full max-w-[1440px] items-center gap-2.5 py-4 justify-center">
      <div class="flex max-w-[660px] items-center justify-center gap-2">
        <span class="text-xs text-[#1D1D1F]">年末年始の休業のお知らせ（休業期間：12月29日〜1月2日）</span>
        <a target="_blank" class="flex w-[78px] items-center gap-1 hover:opacity-70" href="/news/251205">
          <span class="text-xs text-[#007AFF]">今すぐ見る</span>
          <svg>...</svg>
        </a>
      </div>
    </div>
  </div>
</div>
```

---

## 6. 푸터 구조

### 6.1 푸터 HTML 구조
```html
<footer class="relative w-full bg-[#F5F5F7]">
  <div class="relative mx-auto flex max-w-[1200px] gap-10 px-10 py-12">
    <!-- 로고 및 회사 소개 -->
    <div class="flex w-[289px] flex-col gap-7">
      <a class="relative h-12 w-[174px]" href="/">
        <img alt="Brixa" loading="lazy" decoding="async" data-nimg="fill" class="object-contain object-left" srcset="/logo-footer.png">
      </a>
      <p class="text-xs leading-[1.6] text-[#1D1D1F] whitespace-pre-line">常識を変えるシームレスな体験。
オンラインでつなぐ、新しい"ものづくり"のかたち。</p>
      <!-- 소셜 미디어 링크 -->
    </div>

    <!-- 푸터 네비게이션 -->
    <div class="ml-auto flex justify-between gap-[60px]">
      <div class="flex flex-col gap-6">
        <a class="text-xs text-[#1D1D1F] transition-colors hover:text-[#666666]" href="/company">運営会社</a>
        <a class="text-xs text-[#1D1D1F] transition-colors hover:text-[#666666]" href="/quality-assurance">注意事項と品質保証</a>
        <a class="text-xs text-[#1D1D1F] transition-colors hover:text-[#666666]" href="/guide">入稿データガイド</a>
        <a class="text-xs text-[#1D1D1F] transition-colors hover:text-[#666666]" href="/terms">利用規約</a>
        <a class="text-xs text-[#1D1D1F] transition-colors hover:text-[#666666]" href="/law">特定商取引法に基づく表記</a>
        <a class="text-xs text-[#1D1D1F] transition-colors hover:text-[#666666]" href="/privacy">プライバシーポリシー</a>
      </div>
      <div class="flex flex-col gap-6">
        <a class="text-xs text-[#1D1D1F] transition-colors hover:text-[#666666]" href="/contact">問い合わせ</a>
        <a class="text-xs text-[#1D1D1F] transition-colors hover:text-[#666666]" href="/sample-request">サンプル請求</a>
        <a class="text-xs text-[#1D1D1F] transition-colors hover:text-[#666666]" href="/simulation">スマート見積り</a>
      </div>
    </div>
  </div>

  <!-- 프라이버시 마크 -->
  <div class="relative mx-auto flex max-w-[1200px] gap-10 px-10 py-4 justify-start">
    <a target="_blank" rel="noopener noreferrer" href="https://privacymark.jp/">
      <img alt="p mark" loading="lazy" width="100" height="100" decoding="async" data-nimg="1" srcset="/images/19001687_jp.png">
    </a>
  </div>

  <!-- 저작권 정보 -->
  <div class="relative mx-auto flex max-w-[1200px] gap-10 px-10 pt-4 pb-12 justify-end">
    <p class="text-xs text-[#1D1D1F]">© 2021 株式会社イクスラボ</p>
  </div>
</footer>
```

---

## 7. UI 컴포넌트 통계

### 7.1 페이지 요소 통계
- **버튼**: 11개
- **링크**: 41개
- **입력 필드**: 2개
- **div 요소**: 68개
- **이미지**: 4개

### 7.2 주요 UI 패턴

#### 7.2.1 버튼 스타일
```css
/* 기본 버튼 */
flex items-center gap-2 px-8 py-3 border border-[#007AFF] text-[#007AFF] rounded-full hover:bg-blue-50 transition-colors

/* 활성화된 버튼 */
bg-[#007AFF] text-white

/* 아이콘 버튼 */
flex h-[38px] w-12 flex-col items-center cursor-pointer hover:opacity-70 transition-opacity duration-300
```

#### 7.2.2 입력 필드 스타일
```css
/* 기본 입력 필드 */
w-[298px] h-[46px] pl-12 pr-10 border border-[#D9D9D9] rounded-xl text-sm placeholder-[#CCCCCC] focus:outline-none focus:ring-2 focus:ring-[#007AFF]
```

#### 7.2.3 카드/패널 스타일
```css
/* 사이드바 */
bg-white shadow-xl lg:shadow-none rounded-2xl

/* 콘텐츠 영역 */
bg-white rounded-xl hover:bg-gray-50 transition-colors
```

---

## 8. 페이지 라우팅 구조

### 8.1 메인 네비게이션 경로
```
/mypage - 마이페이지 메인
/mypage/orders - 주문 상태
/mypage/orders/new - 신규 주문
/mypage/orders/histories - 재주문/주문이력
/mypage/deliveries - 배송지 목록
/mypage/senders - 발송처 목록 (현재 페이지)
/mypage/invoices - 청구처 목록
/mypage/edit - 회원 정보 수정
/estimates - 견적 이력
```

### 8.2 외부 링크
- `/contact` - 문의하기
- `/sample-request` - 샘플 요청
- `/simulation` - 스마트 견적
- `/news/251205` - 공지사항

---

## 9. 기타 UI 요소

### 9.1 플로팅 액션 버튼 (FAB)
```html
<div class="fixed bottom-[30%] right-0 z-40 flex flex-col gap-3 transition-opacity duration-500 opacity-0 pointer-events-none">
  <a class="group relative flex h-[198px] w-10 items-center justify-center overflow-hidden rounded-l-xl bg-gradient-to-b from-[#178AF7] via-[#6918F6] to-[#F65B18] transition-all hover:shadow-lg hover:opacity-70" href="/simulation">
    <div class="absolute inset-0 bg-gradient-to-b from-[#178AF7] via-[#6918F6] to-[#F65B18]"></div>
    <div class="relative flex flex-col items-center gap-1.5 px-3 py-4">
      <svg>...</svg>
      <span class="writing-mode-vertical text-base text-white whitespace-nowrap">スマート見積り</span>
    </div>
  </a>
</div>
```

### 9.2 쿠키 동의 배너
```html
<div class="CookieConsent" style="...">
  <div class="" style="...">
    <span>当サイトでは、お客様により良いサービスを提供するためにCookieを使用しています。 Cookieの使用に同意いただける場合は「同意する」をクリックしてください。</span>
  </div>
  <div class="">
    <button class="" style="...">拒否する</button>
    <button class="" style="...">同意する</button>
  </div>
</div>
```

---

## 10. 분석 결과 요약

### 10.1 주요 기능
1. **알림 시스템**: 7개의 알림 존재
2. **주문 관리**: 신규 주문, 재주문, 주문이력 관리
3. **배송/청구 정보**: 배송지, 발송처, 청구처 관리
4. **검색 기능**: 키워드 검색 지원
5. **정렬 기능**: 최신순 정렬 옵션
6. **반응형 디자인**: 모바일/태블릿 지원

### 10.2 UI/UX 특징
- **컬러 패턴**: #007AFF (주요색), #FAFAFC (배경), #F5F5F7 (경계)
- **타이포그래피**: Noto Sans JP 사용
- **간격**: 4px 단위의 그리드 시스템
- **애니메이션**: hover 효과, transition 사용
- **아이콘**: SVG 아이콘 통일

### 10.3 개선 포인트
1. **현재 페이지**: 발송처 정보가 없는 상태
2. **사용자 경험**: 사이드바가 모바일에서 숨겨져 있음
3. **접근성**: 대체 텍스트 필요성 확인
4. **성능**: 이미지 최적화 확인 필요

---

## 11. 생성된 파일 목록

### 11.1 분석 결과 파일
- `brixa-analysis-report.md` - 상세 분석 보고서
- `brixa-mypage-final.png` - 마이페이지 전체 스크린샷
- `brixa-mypage-full.html` - 전체 HTML 소스
- `brixa-header-mypage.html` - 헤더 HTML 구조
- `brixa-login-page.html` - 로그인 페이지 HTML
- `brixa-login-screenshot.png` - 로그인 페이지 스크린샷

### 11.2 추가 분석 파일
- `brixa-nav-1.html` - 네비게이션 요소 1
- `brixa-nav-2.html` - 네비게이션 요소 2
- `brixa-nav-3.html` - 네비게이션 요소 3

---

이 분석 보고서는 Task Master AI의 태스크 #34(회원 대시보드 시스템) PRD 갱신에 활용할 수 있습니다.