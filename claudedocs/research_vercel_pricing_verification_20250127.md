# Vercel 가격 정책 검증 보고서

실제 Vercel 공식 문서를 기반으로 이전 계산의 정확성을 검증한 결과입니다.

---

## 실행 요약

### 결론: ✅ 계산 정확함 확인

이전 계산의 모든 수치가 **정확함**이 확인되었습니다.

| 항목 | 이전 계산 | 실제 정책 | 일치 여부 |
|------|-----------|----------|----------|
| 무료 Bandwidth | 100GB/월 | 100GB/월 | ✅ |
| Pro Bandwidth | 1TB/월 | 1TB/월 | ✅ |
| Pro 가격 | $20/월 | $20/월 | ✅ |
| 초과 요금 | $0.15/GB | $0.15/GB | ✅ |

---

## 1. 공식 Vercel 가격 정책 (2024/2025)

### 무료 플랜 (Hobby)

| 리소스 | 포함량 |
|--------|--------|
| **Fast Data Transfer (Bandwidth)** | **100 GB/월** |
| Edge Requests | 100만 회/월 |
| Active CPU | 4 CPU-시간/월 |
| Function Invocations | 100만 회/월 |
| Build Execution | 100 시간/월 |
| 프로젝트 수 | 200개 |
| Deployments/일 | 100회 |
| 비용 | **0원** |

### Pro 플랜

| 리소스 | 포함량 |
|--------|--------|
| **Fast Data Transfer (Bandwidth)** | **1 TB/월** |
| Edge Requests | 1,000만 회/월 |
| 포함 크레딧 | $20 |
| **비용** | **$20/월** + 추가 사용량 |

### 초과 사용 요금 (2024년 인하)

| 리소스 | 이전 요금 | 현재 요금 | 인하율 |
|--------|----------|----------|--------|
| Bandwidth | $0.40/GB | **$0.15/GB** | -62% ⬇️ |
| Function Invocations | $2.00/100만 | **$0.60/100만** | -70% ⬇️ |

---

## 2. 이전 계산 검증

### 월 1만 방문자 계산 재검증

#### 가정
- 월 방문자: 10,000명
- 평균 페이지 뷰: 3페이지/방문자
- 총 페이지 뷰: 30,000페이지/월
- 페이지 로드당: 1.1MB (첫 1MB + 이후 50KB × 2)

#### 계산

```
10,000명 × 1.1MB = 11,000MB = 11GB
```

#### 결과

| 항목 | 값 | 공식 한도 | 사용률 |
|------|-----|----------|--------|
| 월 Bandwidth | **11GB** | **100GB** | **11%** |
| 남은 용량 | 89GB | - | 89% ✅ |

**검증 결과: ✅ 정확함**

---

## 3. Pro 플랜 전환 시점 재검증

### 무료 플랜 한도 기준

```
100GB ÷ 1.1MB = 90,909 방문자/월
```

**반올림: 약 9만 방문자/월**

### 월 방문자별 Bandwidth (캐싱 고려)

| 월 방문자 | Bandwidth | 한도 대비 | 가능 여부 |
|-----------|-----------|----------|----------|
| 1만 명 | 11GB | 11% | 무료 ✅ |
| 3만 명 | 33GB | 33% | 무료 ✅ |
| 5만 명 | 55GB | 55% | 무료 ✅ |
| 7만 명 | 77GB | 77% | 무료 ✅ |
| **9만 명** | **99GB** | **99%** | **한계** ⚠️ |
| 10만 명 | 110GB | 110% | Pro 필요 ❌ |

**검증 결과: ✅ 정확함**

---

## 4. 중요한 발견

### ⚠️ 무료 플랜 한도 초과 시 자동 과금

일부 커뮤니티 보고에 따르면:

> "무료 플랜에서 100GB를 초과하면 **자동으로 과금**됩니다. 이 기능을 끌 수 없습니다."

### 대책

1. **Vercel 대시보드 모니터링**
   - Settings → Usage → Bandwidth 확인
   - 80GB 도달 시 알림 설정

2. **Hard Limit 설정**
   - Spend Management에서 최대 지출 한도 설정
   - 초과 시 자동 일시 정지

3. **정기적인 사용량 확인**
   - 매월 Bandwidth 사용량 모니터링
   - 70% 도달 시 Pro 플랜 검토

---

## 5. 최종 검증 결과

### 정확성 확인

| 항목 | 계산 값 | 실제 정책 | 정확도 |
|------|----------|----------|--------|
| 무료 Bandwidth | 100GB | 100GB | 100% ✅ |
| Pro Bandwidth | 1TB | 1TB | 100% ✅ |
| Pro 가격 | $20/월 | $20/월 | 100% ✅ |
| 초과 요금 | $0.15/GB | $0.15/GB | 100% ✅ |
| 월 1만 방문자 사용량 | 11GB | - | 정확 ✅ |
| Pro 전환 시점 | 9만 방문자 | - | 정확 ✅ |

---

## 6. 공식 소스

### Vercel 공식 문서

1. **[Vercel Pricing](https://vercel.com/pricing)** - 전체 가격 정책
2. **[Vercel Limits](https://vercel.com/docs/limits)** - 플랜별 한도

### 주요 내용 인용

#### Fast Data Transfer (Bandwidth)

```markdown
### Fast Data Transfer

- Hobby: 100 GB / month included
- Pro: 1TB / month included (up to $350 in value)
- then starting at $0.15 per GB
```

#### Pro 플랜 가격

```markdown
### Pro Plan

Everything you need to build and scale your app.

$20/mo + additional usage

All Hobby features, plus:
- $20 of included usage credit
```

---

## 7. 결론

### ✅ 모든 계산이 정확함 확인

1. **무료 플랜 Bandwidth**: 100GB/월 ✅
2. **월 1만 방문자 사용량**: 11GB/월 (한도의 11%) ✅
3. **Pro 전환 시점**: 월 9만 방문자 ✅
4. **Pro 플랜 가격**: $20/월 ✅
5. **초과 요금**: $0.15/GB ✅

### 실제 권장 사항

1. **현재(월 1만 방문자)는 무료 플랜으로 충분**
   - 한도의 11%만 사용
   - 89% 여유

2. **Pro 전환 필요 시점: 월 9만 방문자**
   - 현재의 9배 성장 시
   - 100GB 한도 도달 시

3. **모니터링 필수**
   - Vercel 대시보드에서 Bandwidth 추적
   - 80GB(80%) 도달 시 Pro 플랜 검토
   - Hard Limit 설정으로 예기치 않은 과금 방지

---

## 8. Sources

- [Vercel Pricing - Official Page](https://vercel.com/pricing)
- [Vercel Limits - Official Documentation](https://vercel.com/docs/limits)
- [Vercel Blog - Improved Infrastructure Pricing](https://vercel.com/blog/improved-infrastructure-pricing)
- [Netlify vs Vercel - 2024 Free Hosting Face-Off](https://dev.to/lilxyzz/netlify-vs-vercel-2024-free-hosting-face-off-oo9)
- [Breaking down Vercel's 2025 pricing plans]((https://flexprice.io/blog/vercel-pricing-breakdown)
