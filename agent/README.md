# Label Printer Agent (Brother QL-820NWB)

샘플 의뢰 수취인 라벨 자동 인쇄 에이전트. Supabase의 `label_prints` 작업을 폴링하여
62mm 연속 롤(DK-2205)에 인쇄합니다.

## 인쇄 백엔드 (2026-09-05 실기 검증 반영)

| 백엔드 | 설정값 | 용도 |
|---|---|---|
| **Windows 스풀러 (사무실 기본)** | `LABEL_PRINT_BACKEND=windows_spooler` | 렌더링된 PNG를 **공식 Brother Windows 드라이버 큐**로 제출 (GDI). 실기 검증됨 |
| Raw TCP (명시적 폴백) | `LABEL_PRINT_BACKEND=brother_ql_raw` | brother-ql-next CLI → TCP 9100 raw raster. 진단/호환 확인용 |

**왜 기본이 스풀러인가**: raw TCP(9100)는 프린터 도달·Raster 모드·롤 장착이 정상임에도
프린터 LCD에서 `Wrong Roll Type / Check the print data and try again` 반복 실패
(`--label 62`, `--label 62red --red` 모두). 반면 **공식 드라이버 시험 인쇄는 물리적 성공**
(큐: `Brother QL-820NWB USB Setup`, 포트: USB003). 미디어 타입 핸드셰이크를 드라이버에
위임하는 스풀러 경로가 프로덕션 기본값입니다.

## 사무실 PC 설치 (Windows)

1. Python 3.10+ 설치
2. 이 `agent/` 폴더를 사무실 PC에 복사 (git clone 또는 zip)
3. 설치:
   ```bat
   cd agent
   pip install -r requirements.txt
   copy .env.example .env   ← 값 입력 (아래 필수 항목)
   ```
   `.env` 필수 값:
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
   - `LABEL_PRINT_BACKEND=windows_spooler`
   - `LABEL_WINDOWS_PRINTER_NAME=Brother QL-820NWB USB Setup` (검증된 큐 이름 그대로)
   - **드라이버 기본 용지를 62mm 연속용지로 설정** (Windows 설정 → 프린터 → 인쇄 기본 설정)
4. 테스트: `python -m pytest -q`

## F1 실기 인쇄 테스트 (Windows 스풀러 백엔드 — 배치 연동 전 필수 게이트)

```bat
:: 1) 테스트 라벨 PNG 렌더링 (696px, 4필드)
python -c "from label_renderer import render_label; render_label('123-4567','東京都港区テスト1-2-3','株式会社テスト','山田太郎','out/f1.png')"

:: 2) 스풀러 백엔드로 제출 (공식 드라이버 큐 경유)
python -c "from printer import print_label; r = print_label('out/f1.png'); print(r)"

:: 기대 결과: PrintResult(ok=True, attempts=1, error=None)
:: 라벨 확인: 우편번호/주소/회사명/담당자 인쇄 + 드라이버 자동 컷
```

사전 확인: `Windows 설정 → 프린터 및 스캐너 → Brother QL-820NWB USB Setup → 인쇄 기본 설정`에서
용지가 **62mm 연속용지(DK)**로 되어 있는지 확인. 다르면 변경 후 위 2번 재실행.

실패 시: `PrintResult(ok=False)`의 error 메시지 확인 — 큐 이름 오타/드라이버 기본 용지 문제가 대부분.

## Raw TCP 폴백 (필요 시에만)

`.env`에서 `LABEL_PRINT_BACKEND=brother_ql_raw` + `LABEL_PRINTER_URL=tcp://192.168.0.25:9100` 설정 후
동일 F1 절차. ⚠️ 실기 검증에서 LCD "Wrong Roll Type" 실패 확인 — 진단 목적으로만 사용.

## Windows 시작 등록
`shell:startup` 폴더에 `python main.py` 실행 바로가기 추가 (start_agent.bat 사용).

## 수동 검증 체크리스트 (F1~F5)
- F1: 실기 1장 인쇄 (위 절차) — 배치 연동 전 게이트
- F2: 평일 17:00 배치 실전 (당일 접수분 전체)
- F3: 프린터 off → failed 기록 → on 후 자동 재인쇄
- F4: 관리자 페이지 재인쇄 → 60초 내 인쇄
- F5: 17:00 이후 접수분은 익일 배치로
