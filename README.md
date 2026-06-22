# saweol-schedule

라이브점 시즌2 주간 예약현황 관리 (요일×방 캘린더, 공연 Info, 관객/GM 입력).

## 스택
Next.js 14 · Supabase · Vercel · Tailwind

## 로컬 실행
1. `cp .env.local.example .env.local` 후 값 채우기
2. Supabase SQL Editor에 `supabase/schema.sql` 실행
3. `npm install && npm run dev`

## 환경변수
- `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SECRET_KEY` (서버 전용 시크릿 키)
- `APP_PASSWORD` (입장 비번), `AUTH_COOKIE_SECRET` (임의 긴 문자열)

## 배포 (Vercel)
- GitHub 연동 후 위 환경변수 등록 → 자동 배포
