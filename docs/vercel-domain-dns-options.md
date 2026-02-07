# Vercel 도메인 연결: 네임서버 옵션 비교

Xserver 메일 서버를 계속 사용하면서 Vercel에 배포하는 방법입니다.

---

## 두 가지 옵션

| 옵션 | 네임서버 | 메일 서버 | 난이도 | 추천도 |
|------|----------|-----------|--------|--------|
| **A. CNAME 방식** | Xserver 유지 | Xserver 그대로 | ★☆☆ | ★★★★★ |
| **B. 네임서버 변경** | Vercel로 변경 | MX 레코드 추가 | ★★☆ | ★★★☆☆ |

---

## 옵션 A: CNAME 방식 (추천)

Xserver 네임서버를 유지하며 Vercel에 연결합니다.

### 장점
- ✅ Xserver 메일 서버 그대로 사용
- ✅ 기타 Xserver DNS 서비스 그대로
- ✅ MX 레코드 자동 관리
- ✅ 설정이 간단함

### 단점
- 네임서버는 Xserver (실제로는 문제 안 됨)

### 설정 방법

#### 1. Vercel에서 도메인 추가 (CNAME)

Vercel 대시보드 → Settings → Domains

```
도메인: your-domain.com
추가 후 안내에 따름
```

#### 2. Xserver DNS에 레코드 추가

Xserver 서버 패널 → DNS 설정

##### A. 루트 도메인 (@)

```
타입: A
이름: @ (또는 비워둠)
IPv4 주소: 76.76.21.21 (Vercel IPv4)
TTL: 3600
```

##### B. www 서브도메인

```
타입: CNAME
이름: www
값: cname.vercel-dns.com
TTL: 3600
```

##### C. (선택) Vercel용 CNAME 플랫

```
타입: CNAME
이름: your-domain.com
값: cname.vercel-dns.com
TTL: 3600
```

#### 3. 확인

```bash
# DNS 전파 확인
dig your-domain.com
dig www.your-domain.com
```

### MX 레코드 (자동 유지)

Xserver 네임서버를 유지하므로 기존 MX 레코드가 자동으로 작동합니다:

```
your-domain.com.  IN MX 10 your-domain.com.xsmtp.jp
```

---

## 옵션 B: 네임서버 변경

Vercel 네임서버로 변경하고 MX 레코드를 수동으로 추가합니다.

### 장점
- ✅ Vercel 대시보드에서 DNS 관리
- ✅ Vercel의 다른 DNS 기능 사용

### 단점
- ⚠️ MX 레코드 수동 추가 필요
- ⚠️ Xserver DNS 자동 관리 불가
- ⚠️ 메일 설정 실수하면 메일 수신 불가

### 설정 방법

#### 1. 네임서버 변경

Xserver → 도메인 설정 → 네임서버 변경

```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

#### 2. Vercel DNS에 MX 레코드 추가

Vercel 대시보드 → Settings → Domains → DNS

##### Xserver 메일 서버 MX 레코드

```
타입: MX
이름: @
값: your-domain.com.xsmtp.jp
우선순위: 10
```

**중요**: 정확한 MX 레코드 값은 Xserver 관리판에서 확인해야 합니다.

#### 3. 기타 Xserver DNS 레코드

필요한 다른 레코드도 모두 추가:

```
# SPF (이메일 위조 방지)
타입: TXT
이름: @
값: v=spf1 include:spf.xserver.jp ~all

# DKIM (선택, Xserver 설정에 따라)
타입: CNAME
이름: default._domainkey
값: default._domainkey.xsmtp.jp
```

#### 4. 메일 동작 확인

```bash
# MX 레코드 확인
dig MX your-domain.com

# 결과 예시
your-domain.com.  IN MX 10 your-domain.com.xsmtp.jp
```

---

## Xserver 메일 서버 정보 확인

### 현재 MX 레코드 확인

```bash
# 현재 MX 레코드 확인
dig MX your-domain.com

# 또는
nslookup -type=mx your-domain.com
```

### Xserver 메일 서버 정보

일반적인 Xserver MX 레코드:

```
호스트: your-domain.com
MX 서버: your-domain.com.xsmtp.jp
우선순위: 10
```

**정확한 값은 Xserver 서버 패널에서 확인하세요:**

1. Xserver 서버 패널 로그인
2. 메일 설정 → 메일 서버 정보
3. MX 레코드 값 확인

---

## 추천: 옵션 A (CNAME 방식)

### 왜 CNAME 방식이 좋은가?

1. **메일 서버 안정성**
   - MX 레코드를 직접 관리할 필요 없음
   - 실수로 메일 수신이 안 되는 일 없음

2. **설정 간단**
   - A/CNAME 레코드만 추가
   - 5분 안에 완료

3. **이미 구입한 도메인**
   - Xserver에서 도메인 관리 계속
   - 메일 포워딩 등 기존 설정 유지

### 실제 차이 없음

- 웹사이트 성능: 차이 없음
- SSL: Vercel이 자동 발급
- SEO: 차이 없음

---

## 설정 체크리스트

### 옵션 A (CNAME) 선택 시

- [ ] Vercel에서 도메인 추가
- [ ] Xserver DNS에 A 레코드 추가 (@ → 76.76.21.21)
- [ ] Xserver DNS에 CNAME 추가 (www → cname.vercel-dns.com)
- [ ] HTTPS 확인 (Vercel 자동 발급)
- [ ] 메일 송수신 확인

### 옵션 B (네임서버 변경) 선택 시

- [ ] Xserver 네임서버 변경 (ns1.vercel-dns.com)
- [ ] Vercel DNS에 MX 레코드 추가
- [ ] Vercel DNS에 SPF TXT 레코드 추가
- [ ] Vercel DNS에 DKIM 레코드 추가 (필요 시)
- [ ] MX 레코드 전파 확인 (dig MX)
- [ ] 메일 송수신 테스트
- [ ] HTTPS 확인

---

## 트러블슈팅

### 문제: 메일이 수신되지 않음

```bash
# MX 레코드 확인
dig MX your-domain.com

# 예상 결과:
# your-domain.com.  IN MX 10 your-domain.com.xsmtp.jp

# 결과가 없으면 MX 레코드 추가 필요
```

### 문제: HTTPS가 작동하지 않음

```bash
# DNS 전파 확인
dig your-domain.com

# A 레코드가 76.76.21.21 또는 Vercel IP를 가리키는지 확인
```

### 문제: 이메일 발송이 스팸으로 분류

SPF/DKIM 레코드가 제대로 설정되었는지 확인:

```bash
# SPF 확인
dig TXT your-domain.com

# DKIM 확인
dig TXT default._domainkey.your-domain.com
```

---

## 요약

### ✅ 추천: 옵션 A (CNAME)

```
1. 네임서버: Xserver 유지
2. 메일: Xserver 그대로 사용
3. 웹: Vercel로 연결 (A/CNAME 레코드)
```

**장점**: 메일 서버 건드리지 않음, 안전, 간단

### ⚠️ 신중하게: 옵션 B (네임서버 변경)

```
1. 네임서버: Vercel로 변경
2. 메일: MX 레코드 수동 추가
3. 웹: Vercel 자동 관리
```

**주의**: MX 레코드 실수하면 메일 수신 불가

---

## 결론

**Xserver 메일 서버를 계속 사용하신다면 옵션 A (CNAME 방식)을 추천합니다!**

도움이 필요하시면 말씀해주세요.
