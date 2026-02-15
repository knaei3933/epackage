# Quotations 페이지 버튼 디자인 개선

**날짜**: 2026-01-04
**상태**: ✅ 완료
**수정 파일**: 3개 파일

---

## 개요

Epackage Lab의 기존 색상 테마를 유지하면서 Member Quotations 페이지의 버튼을 더 현대적이고 전문적으로 개선했습니다.

---

## 개선된 디자인 특징

### 1. 색상 테마 유지 ✅
- 모든 버튼이 기존 `--brixa-*` CSS 변수 사용
- 프라이머리 버튼: `--brixa-primary-500` ~ `--brixa-primary-700` 그라데이션
- 세컨더리 버튼: `--brixa-primary-200` 테두리 + `--brixa-primary-50` 호버
- 새로운 색상 추가 없음

### 2. 시각적 계층 구조 📊
```
프라이머리 (注文する/発注する)  → 그라데이션 + 그림자 + 광택 효과
세컨더리 (詳細を見る/戻る)    → 테두리 + 부드러운 호버
아웃라인 (PDFダウンロード)      → 투명 배경 + 컬러 테두리
파괴적 (削除)                → 빨간 그라데이션 + 경고 그림자
```

### 3. 마이크로 인터랙션 🎯
- **호버**: 아이콘 확대 (1.1배), 그림자 상승, 색상 변화
- **액티브**: 축소 (0.98), 그림자 감소
- **로딩**: 다운로드는 회전, 삭제는 펄스 애니메이션
- **광택 효과**: 프라이머리 버튼에 왼쪽에서 오른쪽으로 그라데이션 스윕

### 4. 접근성 ♿
- `focus-visible:ring-2` 적절한 오프셋
- `disabled:opacity-50` pointer-events-none
- 높은 대비비 유지
- 부드러운 `duration-200` 전환 (너무 빠르거나 느리지 않음)

---

## 버튼 변형별 디자인

### 프라이머리 버튼 (注文する, 発注する)

**시각적 처리**:
```css
/* 깊이가 있는 그라데이션 배경 */
background: linear-gradient(to bottom right,
  var(--brixa-primary-500),
  var(--brixa-primary-700)
);

/* 돋보기를 위한 그림자 */
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

/* 호버: 더 높은 그림자 */
box-shadow: 0 10px 15px -3px rgba(94, 182, 172, 0.3);

/* 호버 시 광택 효과 */
::before {
  background: linear-gradient(to right,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  animation: sweep 500ms;
}
```

**사용처**:
- 주요 CTA (注文に変換, 注文する)
- 개별 항목 작업 (発注する)

---

### 세컨더리 버튼 (詳細を見る, 戻る)

**시각적 처리**:
```css
/* 깔끔한 테두리 디자인 */
background: var(--bg-primary);
border: 2px solid var(--brixa-primary-200);
color: var(--brixa-primary-700);

/* 부드러운 호버 */
&:hover {
  background: var(--brixa-primary-50);
  border-color: var(--brixa-primary-300);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
```

**사용처**:
- 네비게이션 (戻る, 詳細を見る)
- 덜 중요한 작업

---

### 아웃라인 버튼 (PDFダウンロード)

**시각적 처리**:
```css
/* 투명 배경에 컬러 테두리 */
background: transparent;
border: 2px solid var(--brixa-primary-300);
color: var(--brixa-primary-700);

/* 부드러운 호버 전환 */
&:hover {
  background: var(--brixa-primary-50);
  border-color: var(--brixa-primary-400);
}
```

**사용처**:
- 다운로드 (PDFダウンロード)
- 보조 작업

---

### 파괴적 버튼 (削除)

**시각적 처리**:
```css
/* 경고를 위한 빨간 그라데이션 */
background: linear-gradient(to bottom right,
  var(--error-500),
  var(--error-600)
);

/* 호버 시 빨간 틴트 그림자 */
&:hover {
  box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.2);
}
```

**사용처**:
- 파괴적 작업 (削除)
- 드래프트 전용 작업

---

## 아이콘 애니메이션

### 로딩 상태

**PDF 다운로드** (진행 중):
```tsx
<Download className="animate-spin" />
```

**삭제** (진행 중):
```tsx
<Trash2 className="animate-pulse" />
```

### 호버 효과

**아이콘 확대**:
```tsx
<Eye className="group-hover/btn:scale-110 transition-transform" />
```

**화살표 슬라이드** (뒤로 가기 버튼):
```tsx
<ArrowLeft className="group-hover/btn:-translate-x-0.5" />
```

---

## 레이아웃 개선

### Quotations 목록 페이지 (`page.tsx`)

**이전**:
```tsx
<div className="flex flex-col gap-2">
  <Button variant="secondary">詳細を見る</Button>
  <Button variant="outline">PDFダウンロード</Button>
  <Button variant="destructive">削除</Button>
</div>
```

**개선 후**:
```tsx
<div className="flex flex-col gap-2.5">
  <Button variant="secondary" className="group/btn">
    <Eye className="group-hover/btn:scale-110" />
    詳細を見る
  </Button>
  {/* 개선된 간격, 마이크로 인터랙션 */}
</div>
```

**변경사항**:
- 간격을 `2`에서 `2.5`로 증가 (더 나은 분리)
- 아이콘 호버 효과를 위한 `group/btn` 추가
- 아이콘 간격을 위한 `mr-1.5` 추가
- 아이콘 크기 `w-4 h-4`로 고정

---

### Quotation 상세 페이지 (`[id]/page.tsx`)

**이전**:
```tsx
<div className="flex flex-wrap gap-3">
  <Button variant="secondary">戻る</Button>
  <Button variant="outline">PDFダウンロード</Button>
  <Button variant="primary">注文する</Button>
</div>
```

**개선 후**:
```tsx
<Card className="bg-gradient-to-br from-[var(--bg-secondary)]">
  <div className="flex items-center gap-3">
    <Button variant="ghost">戻る</Button>

    <div className="flex-1" /> {/* 스페이서 */}

    <div className="flex gap-3">
      <Button variant="outline">PDFダウンロード</Button>
      <Button variant="primary" className="shadow-lg">注文する</Button>
    </div>
  </div>
</Card>
```

**변경사항**:
- 미세한 그라데이션 배경의 Card로 래핑
- 뒤로 가기 버튼 왼쪽 정렬 (ghost 변형)
- 작업 오른쪽 정렬 (flex 스페이서)
- 프라이머리 CTA에 `shadow-lg`로 강조
- 더 나은 시각적 그룹화

---

## 반응형 디자인

### 데스크톱 (> 768px)
```css
.btn-action-group {
  display: flex;
  flex-direction: row;
  gap: 0.75rem;
}
```

### 모바일 (≤ 768px)
```css
.btn-action-group {
  flex-direction: column;
  width: 100%;
}

.btn-action-group > * {
  width: 100%;
}
```

**결과**: 더 나은 터치 타겟을 위해 모바일에서 버튼이 수직으로 정렬

---

## 사용된 CSS 변수

### Brixa Primary (브랜드 그린)
```css
--brixa-primary-500: #47A39A;  /* 호버 상태 */
--brixa-primary-600: #3A827B;  /* 기본값 */
--brixa-primary-700: #2D6C65;  /* 액티브/텍스트 */
--brixa-primary-800: #235954;  /* 어두운 호버 */
```

### 기능 색상
```css
--error-500: #EF4444;    /* 파괴적 배경 */
--error-600: #DC2626;    /* 파괴적 호버 */
--bg-primary: #FFFFFF;   /* 카드 배경 */
--bg-secondary: #F9FAFB; /* 미세한 배경 */
```

---

## 성능 고려사항

### 애니메이션 성능
- ✅ `transform`과 `opacity` 사용 (GPU 가속)
- ✅ `duration-200` 빠른 느낌
- ✅ `ease-out` 자연 감속
- ❌ `left`/`top` 속성 회피 (리플로우 방지)

### 번들 영향
- 새로운 의존성 없음
- CSS 전용 애니메이션
- 기존 Button 컴포넌트 개선

---

## 접근성 개선

### 포커스 상태
```tsx
focus-visible:ring-2
focus-visible:ring-[var(--brixa-primary-500)]
focus-visible:ring-offset-2
```

### 비활성 상태
```tsx
disabled:pointer-events-none
disabled:opacity-50
```

### 스크린 리더
- 아이콘 버튼에 텍스트 라벨
- 로딩 상태 텍스트 변경으로 알림
- Button 컴포넌트에서 상속된 적절한 ARIA 속성

---

## 브라우저 호환성

### 모던 브라우저 (✅ 전체 지원)
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### 사용된 기능
- CSS 사용자 정의 속성 (var())
- CSS 그라데이션
- CSS 변환
- CSS 전환
- 백드롭 필터 (선택사항)

### 폴백
- 그라데이션 실패 시 단색
- `prefers-reduced-motion` 시 애니메이션 없음
- 컬러 그림자 실패 시 단색 그림자

---

## 변경된 파일

### 1. `src/components/ui/Button.tsx`
- 모든 버튼 변형을 그라데이션으로 개선
- 광택 효과 추가 (`::before` 의사 요소)
- 그림자 상승으로 호버 상태 개선
- 아이콘 애니메이션을 위한 `group` 클래스 추가
- 하위 호환성 유지

### 2. `src/app/member/quotations/page.tsx`
- 버튼 간격 개선 (gap-2.5)
- 아이콘 호버 애니메이션 추가
- 로딩 상태 개선 (spin/pulse)
- 시각적 그룹화 개선

### 3. `src/app/member/quotations/[id]/page.tsx`
- Card 래퍼로 액션 바 재디자인
- flex 스페이서로 더 나은 시각적 계층 구조
- 뒤로 가기 버튼에 ghost 변형
- 프라이머리 CTA에 그림자 상승

### 4. `src/app/globals.css`
- `.btn-premium` 스타일 개선
- `.btn-action-group` 유틸리티 추가
- 개선된 반응형 버튼 동작
- 더 나은 모바일 터치 타겟

---

## 결론

개선된 버튼 디자인 시스템은 다음을 제공합니다:
- ✅ 현대적이고 전문적인 외관
- ✅ 브랜드 색상과의 일관성
- ✅ 부드러운 마이크로 인터랙션
- ✅ 더 나은 시각적 계층 구조
- ✅ 개선된 접근성
- ✅ 반응형 동작
- ✅ 성능 저하 없음

모든 변경 사항은 **하위 호환**되며 **프로덕션 준비**가 되었습니다.
