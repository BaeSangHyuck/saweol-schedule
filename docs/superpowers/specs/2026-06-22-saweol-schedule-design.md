# saweol-schedule 설계 문서

작성일: 2026-06-22

## 목적

라이브점(방탈출/공연) **시즌2 예약현황**을 엑셀(`라이브점 마스터시트.xlsx`)로 관리하던 것을
웹에서 관리한다. 공연을 등록하고(공연 Info), 주간 캘린더의 `요일 × 방` 그리드에
색상 블록으로 배치하며, 블록마다 GM과 관객(이름·메모)을 입력한다.

혼자 쓰는 사이드 프로젝트로, **무료 범위**(Supabase free + Vercel free)에서 가볍게 운영한다.

## 기술 스택 / 배포

| 영역 | 선택 |
|------|------|
| FE | Next.js 14 (App Router) + TypeScript + Tailwind |
| 디자인 | admin(kinderlabs-pos-v2-fe)의 shadcn 토큰을 복제 — HSL CSS 변수(`--primary` 222 47% 13.5% 네이비, `--secondary` indigo), Radix, tailwindcss-animate. 새 repo는 독립이라 `@repo/ui`를 직접 의존하지 않고 룩앤필만 복제 |
| URL 상태 | nuqs (주 선택, 선택된 방 탭 등). searchParams 수동 파싱 금지 |
| DB | Supabase Postgres (free tier) |
| 인증 | **단일 공유 비밀번호**. 환경변수 비번 입력 → 쿠키 발급 → Next.js 미들웨어로 전 페이지 게이트. Supabase Auth/RLS는 사용하지 않음 |
| 배포 | Vercel (free) + Supabase (free) |
| repo | 개인 GitHub public repo `saweol-schedule` |

### 인증 상세
- `/login` 페이지에서 비밀번호 입력 → 서버 액션(또는 API route)이 `process.env.APP_PASSWORD`와 비교
- 일치 시 HttpOnly 쿠키(`auth=<해시 또는 고정 토큰>`) 발급
- `middleware.ts`가 쿠키 없으면 `/login`으로 리다이렉트
- Supabase 접근은 서버 측에서만(서버 컴포넌트/route handler) `SUPABASE_SERVICE_ROLE_KEY` 또는 anon key 사용.
  비번 게이트가 유일한 보호막이므로 클라이언트에 service role key를 노출하지 않는다.

## 데이터 모델 (Supabase 테이블)

```
rooms                 방 (설정 가능)
  id           uuid pk
  name         text          -- '101호'
  sort_order   int

settings              전역 설정 (단일 행, id=1 고정)
  id           int pk default 1
  open_time    text          -- '08:00'
  close_time   text          -- '23:00'
  slot_minutes int           -- 30

shows                 공연 Info
  id                  uuid pk
  title               text
  color               text          -- 팔레트 hex 값 (예 '#f4cccc')
  capacity            int null       -- null = 무제한
  default_play_minutes int null      -- null = "자유" (배치 시 입력)
  resource_link       text null      -- 자료 드라이브 링크 (선택)
  created_at          timestamptz default now()

bookings              캘린더에 배치된 공연 1건
  id               uuid pk
  show_id          uuid fk -> shows(id) on delete cascade
  room_id          uuid fk -> rooms(id)
  date             date           -- '2026-06-19'
  start_time       text           -- '14:00'
  duration_minutes int            -- 블록이 차지하는 길이
  gm_name          text null
  created_at       timestamptz default now()

audiences             관객 (bookings에 종속)
  id          uuid pk
  booking_id  uuid fk -> bookings(id) on delete cascade
  name        text
  memo        text null            -- 후원번호·결제방식 등 자유 기재
  created_at  timestamptz default now()
```

### 색상 팔레트 (shows.color 선택지)
admin 톤과 어울리는 8~12색 파스텔 고정 팔레트. 초기값(엑셀 느낌):
`#f4cccc #fce5cd #fff2cc #d9ead3 #d0e0e3 #cfe2f3 #d9d2e9 #f7b6cd #ead1dc #c9daf8 #b6d7a8 #ffe599`

## 동작 규칙

- 캘린더 블록 배경색 = 연결된 `show.color`. 그리드에서 `duration_minutes / slot_minutes` 칸만큼 세로로 차지
- **공연 배치**: 빈 칸 클릭 → 공연 선택
  - `show.default_play_minutes`가 있으면 그 값으로 자동 배치
  - `null`(자유)이면 모달에서 플레이타임(분) 입력받아 `duration_minutes`에 저장
- **정원**: `show.capacity`가 있으면 블록·패널에 `현재 관객수 / capacity` 표시, 차면 "마감"(빨강).
  `null`이면 `n명 · 무제한`으로 단순 카운트
- **GM**: `booking.gm_name` → 블록 상단 + 패널에서 편집

## 화면 (페이지 3개 + 로그인)

### `/login`
비밀번호 입력 폼. 통과 시 `/`로.

### `/` 주간 캘린더 (메인)
- 상단: 주 이전/다음/오늘, 주 라벨. 현재 주를 nuqs로 URL 동기화(`?week=2026-06-15`)
- 그리드: 가로 `요일(7) × 방(설정값)`, 세로 시간(설정 운영시간·슬롯). 헤더 sticky, 토/일 색 구분.
  **요일 경계(방 묶음 사이)에는 진한 세로 구분선**을 넣어 날짜 단위가 한눈에 구분되게 한다
- 빈 칸 클릭 → 배치 모달(공연 선택, 자유면 시간 입력, GM 선택) → 색상 블록 생성
- 블록 = `show.color` 배경 + `GM / 공연명 / 관객수`
- 블록 클릭 → 우측 패널: GM 편집, 관객 추가/삭제(이름+메모), 정원 표시, 플레이타임 변경, 블록 삭제
- 모바일: 가로 스크롤 + 방 탭으로 좁은 화면 대응

### `/shows` 공연 Info 관리
- 공연 카드 목록(색상 바 + 제목 + 정원/플레이타임/색상/자료링크)
- 추가/수정 폼: 제목, 색상(팔레트 선택), 정원(빈칸=무제한), 기본 플레이타임(빈칸=자유), 자료링크(선택)
- 삭제 시 연결된 bookings는 cascade

### `/settings` 설정
- 방 추가/삭제/순서 변경
- 운영 시작/종료 시각, 슬롯 간격(분)
- 저장 시 캘린더 그리드가 새 설정으로 다시 그려짐

## 컴포넌트 경계 (프론트)

- `WeekCalendar` — 그리드 렌더링(설정·bookings를 받아 표시). 빈칸/블록 클릭 이벤트 위임
- `PlaceBookingModal` — 공연 선택 + 자유 플레이타임 입력 + GM
- `BookingPanel` — 블록 상세(GM·관객·정원·삭제)
- `AudienceList` / `AudienceForm` — 관객 목록·추가
- `ShowForm` / `ShowCard` — 공연 Info CRUD
- `SettingsForm` — 방/시간 설정
- `colors.ts` — 팔레트 상수
- `supabase/` — 서버 측 클라이언트 + 쿼리 함수(읽기/쓰기 한곳에 모음)

데이터 흐름: 서버 컴포넌트에서 Supabase 읽기 → props로 전달 / 변경은 서버 액션(또는 route handler)으로 write 후 `revalidatePath`.

## 에러 / 검증

- 같은 방·시간 겹침 배치: 경고(겹쳐도 저장은 허용하되 시각적으로 겹침 표시) — 초기엔 단순 허용, 추후 검증
- 정원 초과 관객 추가: 경고하되 강제 차단하지 않음(현장 융통성)
- 비번 불일치: 폼에 에러 메시지

## 테스트 / 검증

- 핵심 로직(블록 span 계산, 자유 플레이타임 분기, 정원/마감 판정)은 순수 함수로 분리해 단위 테스트
- 배포 전 로컬에서 캘린더 배치 → 관객 추가 → 새로고침 후 유지 흐름 수동 확인

## 비범위 (YAGNI)

- 다중 사용자 권한/감사 로그
- 결제 연동 (메모 텍스트로만 기록)
- 엑셀 자동 import (초기 데이터는 수동 입력)
- 알림/리마인더
- 다국어
