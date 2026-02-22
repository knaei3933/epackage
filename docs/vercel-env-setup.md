# Vercel 환경 변수 설정 가이드

## Google Drive 연동을 위한 환경 변수

### Vercel 대시보드 접속
```
https://vercel.com/knaei3933's/projects
```

### 프로젝트
- **epackage** 프로젝트 선택
- 또는 직접: `epackage-9p1709fzx-kims-projects-912b33ac`

---

## 환경 변수 설정

### Settings → Environment Variables

다음 변수들을 **Production** 환경에 추가하세요:

---

### 1. Google 클라이언트 ID

| 항목 | 값 |
|------|-----|
| **변수명** | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` |
| **값** | `652139839945-tolfsdiptia0ih915clr0rkf2g836t4t` |
| **환경** | Production |
| **암호화** | ❌ 아니오 (NEXT_PUBLIC_ 변수는 암호화하면 안 됨) |

---

### 2. Google 클라이언트 보안 비밀번호

| 항목 | 값 |
|------|-----|
| **변수명** | `GOOGLE_CLIENT_SECRET` |
| **값** | `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` |
| **환경** | Production |
| **암호화** | ✅ 예 |

---

### 3. 리디렉트 URI

| 항목 | 값 |
|------|-----|
| **변수명** | `NEXT_PUBLIC_GOOGLE_REDIRECT_URI` |
| **값** | `https://epackage-9p1709fzx-kims-projects-912b33ac.vercel.app/api/auth/google/callback` |
| **환경** | Production |

---

### 4. 업로드 폴더 ID

| 항목 | 값 |
|------|-----|
| **변수명** | `GOOGLE_DRIVE_UPLOAD_FOLDER_ID` |
| **값** | `196h0xbr9cFJkuB7w_0U2PH48hghE6OZB` |
| **환경** | Production |

---

### 5. 교정 폴더 ID

| 항목 | 값 |
|------|-----|
| **변수명** | `GOOGLE_DRIVE_CORRECTION_FOLDER_ID` |
| **값** | `1s3wYcRj-GtL1w-6cNBGWckuoikUr8OhD` |
| **환경** | Production |

---

## 입력 방법

1. 각 변수마다 **"+ Variable"** 버튼 클릭
2. 위의 표에 있는 값을 입력
3. **환경** 선택: `Production`
4. **암호화** 설정:
   - `NEXT_PUBLIC_*` 변수: ❌ 아니오
   - 그 외 변수: ✅ 예 (선택 사항)
5. **"Save"** 클릭

---

## 입력 완료 후

- **"Redeploy"** 버튼 클릭하여 재배포
- 또는 `git push` 후 자동 배포

---

## 주의사항

- ⚠️ `NEXT_PUBLIC_GOOGLE_CLIENT_ID`는 **절대 암호화하지 마세요**
- 클라이언트 사이드 JavaScript에서 이 값을 읽어야 합니다
- 암호화하면 OAuth 연결이 작동하지 않습니다
