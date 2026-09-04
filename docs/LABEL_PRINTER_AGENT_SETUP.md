# 라벨프린터 자동화 에이전트 설치 가이드 (사무실 Windows PC)

> 샘플 의뢰 수취인 라벨 자동 인쇄 (Brother QL-820NWBc · 62mm 연속 롤)
> 관련 플랜: `.omx/plans/prd-sample-label-printer-automation.md`

## 1. 사전 준비물

| 항목 | 내용 |
|---|---|
| 프린터 | Brother QL-820NWBc, DK-22205(62mm 백색 연속 롤) 장착 |
| 네트워크 | 프린터가 사무실 공유기에 LAN/Wi-Fi 연결. **검증된 실기 IP: `192.168.0.25`** (DHCP 예약 권장) |
| 인쇄 큐 | **`Brother QL-820NWB USB Setup`** (공식 드라이버, 포트 USB003) — 실기 시험 인쇄 성공 확인됨 |
| PC | Windows 10/11, Python 3.10+, 업무시간 전원 켜짐 (절전 모드 해제 권장) |
| 자격증명 | Supabase `SERVICE_ROLE_KEY` (Supabase Dashboard → Settings → API) |

## 2. 설치

```bat
:: 1) 저장소 복사 (또는 agent/ 폴더만 zip으로 복사)
git clone https://github.com/knaei3933/epackage.git
cd epackage\agent

:: 2) Python 의존성 설치
pip install -r requirements.txt

:: 3) 환경설정 (.env 작성)
copy .env.example .env
::  .env 편집:
::   SUPABASE_URL=https://ijlgpzjdfipzmjvawofp.supabase.co
::   SUPABASE_SERVICE_ROLE_KEY=<실제 키>
::   LABEL_PRINT_BACKEND=windows_spooler
::   LABEL_WINDOWS_PRINTER_NAME=Brother QL-820NWB USB Setup
::   (raw TCP 폴백 시에만: LABEL_PRINT_BACKEND=brother_ql_raw
::                      LABEL_PRINTER_URL=tcp://192.168.0.25:9100)
```

## 3. Windows 시작 등록 (상시 실행)

1. `Win+R` → `shell:startup` 입력
2. `agent\start_agent.bat`의 바로가기를 생성해 폴더에 넣기
3. PC 부팅/로그온 시 에이전트가 자동 실행됨 (60초 폴링 + 평일 17:00 JST 배치)

## 4. 수동 검증 체크리스트 (운영자 실행)

| # | 검증 | 방법 | 통과 기준 |
|---|---|---|---|
| **F1** | 실기 1장 인쇄 (게이트) | README "F1 실기 인쇄 테스트" 절차 — **windows_spooler 백엔드** (render → print_label) | `PrintResult(ok=True)` + 라벨에 우편번호/주소/회사명/담당자 인쇄 + 자동 컷 |
| **F2** | 평일 17:00 배치 | 당일 접수 1건 이상 생성 후 17:00 대기 | 당일 접수분 전체 인쇄, 누락 0 |
| **F3** | 장애 복구 | 프린터 전원 off → 의뢰 접수 → 17:00 경과 → 전원 on | failed 기록 후 다음 폴링/배치에서 자동 재인쇄 |
| **F4** | 관리자 재인쇄 | `/admin/samples` → 라벨 재인쇄 버튼 | 60초 내 인쇄, 중복 pending 없음 |
| **F5** | 마감 경계 | 17:01 이후 접수 1건 생성 | 익일 17:00 배치에서 인쇄 (당일 미포함) |

## 5. 동작 원리 요약

```
[웹] /samples 접수 → sample_request_destinations 저장
                          ↓
[관리자] /admin/samples → POST /api/admin/samples/[id]/reprint
                          ↓ label_prints (pending)
[사무실 PC 에이전트] 60초 폴링 → claim(printing) → 라벨 PNG 렌더(696px@300dpi)
                          → windows_spooler: 공식 Brother 드라이버 큐(GDI) → 인쇄 → printed/failed
                          → (폴백) brother_ql_raw: TCP 9100 raw raster
```

- 인쇄 실패 시 3회 재시도 → failed 기록 → 프린터 복구 후 자동 재처리
- 배치 대상: 직전 배치 이후 접수분 중 printed/pending 없는 배송지 (전부 failed면 재대상)
- 동일 배송지 pending 중복은 DB 유니크 인덱스로 차단

## 6. 문제 해결

| 증상 | 확인 사항 |
|---|---|
| 인쇄 없음 | windows_spooler: 큐 이름 정확성(`LABEL_WINDOWS_PRINTER_NAME`)·드라이버 기본 용지가 62mm 연속용지인지 확인 / brother_ql_raw: `ping 192.168.0.25` |
| LCD "Wrong Roll Type" (raw TCP) | 2026-09-05 실기 재현 확인된 알려진 이슈 — 미디어 타입 핸드셰이크 문제. **windows_spooler 백엔드 사용** (기본값) |
| "brother_ql CLI not found" | `pip install brother-ql-next` 후 PATH 확인 |
| 한글 깨짐 | Windows면 Meiryo 자동 인식. 수동 지정: `.env`의 LABEL_FONT_PATH |
| 관리자 버튼 후 무반응 | 에이전트 실행 여부(작업 관리자에 python), label_prints 테이블에 pending 행 확인 |

## 7. 보안 운영 요구사항 (필수 — 서비스 롤 키 보상 통제)

에이전트는 `SERVICE_ROLE_KEY`를 보관하므로 사무실 PC가 침해되면 키가 유출될 수 있습니다.
현재 구조는 인쇄 작업 단위 DB 롤(RPC 스코핑) 대신 보상 통제로 관리하며, 아래를 **필수**로 준수합니다.

| 통제 항목 | 내용 | 주기/시점 |
| --- | --- | --- |
| 키 순환 | Supabase Dashboard → Settings → API에서 SERVICE_ROLE_KEY 재발급 후 `.env` 갱신 | **90일 이내** 정기 + 담당자 퇴사/PC 분실 시 즉시 |
| 실행 권한 최소화 | PC에서 일반 사용자 계정으로 에이전트 실행 (관리자 권한 불필요) | 설치 시 |
| 디스크 암호화 | BitLocker 활성화 (키·라벨 이미지 보호) | 설치 시 |
| 백신/방화벽 | Windows Defender 활성, 아웃바운드 허용은 supabase.co·프린터 IP로 제한 권장 | 설치 시 |
| 침해 징후 모니터링 | Supabase Auth 로그에서 비정상 service_role 사용 확인 | 월 1회 |

**침해 대응 절차** (키 유출 의심 시):
1. 즉시 SERVICE_ROLE_KEY 재발급(기존 키 폐기) → 2. 사무실 PC 격리 후 백신 전체 검사 → 3. Supabase Auth 로그로 유출 기간 내 비정상 접근 확인 → 4. `.env` 갱신 후 에이전트 재기동

**책임자/기한**: 운영 담당자(설치 시 지정). 다음 정기 점검 시 RPC 스코핑(전용 DB 롤로 enqueue/claim/complete/fail/requeue만 허용) 전환을 검토합니다.
