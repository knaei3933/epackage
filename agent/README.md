# Label Printer Agent (Brother QL-820NWBc)

샘플 의뢰 수취인 라벨 자동 인쇄 에이전트. Supabase의 `label_prints` 작업을 폴링하여
62mm 연속 롤(DK-22205)에 인쇄합니다. 인쇄는 brother-ql-next CLI를 **서브프로세스로** 호출합니다
(TCP 9100 Raw — Brother User's Guide p.187 공식 지원 프로토콜).

## 사무실 PC 설치 (Windows)

1. Python 3.10+ 설치
2. 이 `agent/` 폴더를 사무실 PC에 복사 (git clone 또는 zip)
3. 설치:
   ```bat
   cd agent
   pip install -r requirements.txt
   copy .env.example .env   ← 값 입력 (SUPABASE_URL, SERVICE_ROLE_KEY, LABEL_PRINTER_URL)
   ```
4. 프린터 IP 고정: 공유기 DHCP 예약 설정 (예: 192.168.1.50)
5. **F1 실기 인쇄 테스트** (배치 연동 전 필수 게이트):
   ```bat
   python -c "from label_renderer import render_label; render_label('123-4567','東京都港区テスト1-2-3','株式会社テスト','山田太郎','out/f1.png')"
   brother_ql --backend network --model QL-820NWB --printer tcp://192.168.1.50:9100 print --label 62 out/f1.png
   ```
6. 테스트: `python -m pytest -q`

## Windows 시작 등록
`shell:startup` 폴더에 `python main.py` 실행 바로가기 추가 (G003 완료 후).

## 수동 검증 체크리스트 (F1~F5)
- F1: 실기 1장 인쇄 (위 5번) — 배치 연동 전 게이트
- F2: 평일 17:00 배치 실전 (당일 접수분 전체)
- F3: 프린터 off → failed 기록 → on 후 자동 재인쇄
- F4: 관리자 페이지 재인쇄 → 60초 내 인쇄
- F5: 17:00 이후 접수분은 익일 배치로
