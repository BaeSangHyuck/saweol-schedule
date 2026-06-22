# saweol-schedule Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 라이브점 시즌2 예약현황을 웹에서 관리하는 주간 캘린더 앱(`요일×방` 그리드에 공연을 색상 블록으로 배치, GM·관객 입력)을 무료 스택으로 구축한다.

**Architecture:** Next.js 14 App Router로 서버 컴포넌트에서 Supabase를 읽어 렌더하고, 변경은 서버 액션 → `revalidatePath`. 단일 공유 비밀번호를 미들웨어로 게이트한다. 핵심 시간/정원 계산은 순수 함수(`lib/schedule.ts`)로 분리해 단위 테스트한다.

**Tech Stack:** Next.js 14, TypeScript, Tailwind(shadcn HSL 토큰 복제), nuqs, Supabase(@supabase/supabase-js), Vitest, Vercel.

---

## 작업 디렉토리

모든 경로는 프로젝트 루트 `/Users/baesanghyeog/Desktop/saweol-schedule` 기준이다. 이미 `git init` 됨, spec/plan 커밋 존재.

## File Structure

```
saweol-schedule/
  package.json, tsconfig.json, next.config.mjs, postcss.config.mjs, tailwind.config.ts, vitest.config.ts
  .env.local.example
  middleware.ts                      # 비번 쿠키 게이트
  src/
    app/
      layout.tsx                     # NuqsAdapter + globals
      globals.css                    # shadcn HSL 토큰(admin 복제)
      login/page.tsx                 # 비번 입력
      login/actions.ts               # 비번 검증 서버액션 → 쿠키
      page.tsx                       # 주간 캘린더 (server component)
      shows/page.tsx                 # 공연 Info 목록
      settings/page.tsx              # 방/시간 설정
      actions.ts                     # bookings/audiences/shows/settings/rooms 서버액션
    components/
      AppShell.tsx                   # 사이드바 + 탑바 레이아웃
      WeekCalendar.tsx               # 그리드(요일×방×시간, daysep)
      WeekNav.tsx                    # 주 이동(nuqs)
      PlaceBookingModal.tsx          # 공연 배치(자유 플레이타임 분기)
      BookingPanel.tsx               # 블록 상세(GM·관객·삭제)
      AudienceList.tsx               # 관객 목록/추가/삭제
      ShowForm.tsx, ShowCard.tsx     # 공연 CRUD
      SettingsForm.tsx               # 방/시간 설정
      ui/                            # 최소 shadcn 프리미티브(button,input,dialog 등)
    lib/
      schedule.ts                    # 순수 로직(시간→행, 분→span, 정원/마감, 주 날짜)
      schedule.test.ts
      colors.ts                      # 팔레트 상수
      types.ts                       # DB 행 타입
      supabase/server.ts             # 서버 전용 클라이언트
      supabase/queries.ts            # 읽기 쿼리 모음
  supabase/schema.sql                # 테이블 DDL + seed
  README.md
```

---

## Task 1: Next.js 14 프로젝트 스캐폴드

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `postcss.config.mjs`, `tailwind.config.ts`, `.gitignore`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

- [ ] **Step 1: create-next-app 스캐폴드 (현재 폴더에)**

Run:
```bash
cd /Users/baesanghyeog/Desktop/saweol-schedule
npx create-next-app@14 . --typescript --tailwind --app --src-dir --eslint --no-import-alias --use-npm
```
프롬프트가 뜨면 기본값 수락. 기존 `docs/`·`supabase/`·`.git`은 보존된다(create-next-app이 비어있지 않은 디렉토리를 거부하면 임시 폴더에 생성 후 파일만 복사).

- [ ] **Step 2: 의존성 추가**

Run:
```bash
npm install @supabase/supabase-js nuqs
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 3: dev 서버 부팅 확인**

Run: `npm run dev` → 브라우저 `localhost:3000`에서 기본 페이지 확인 후 Ctrl+C.
Expected: 에러 없이 기동.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "chore: next.js 14 scaffold"
```

---

## Task 2: 디자인 토큰 + 팔레트

admin(kinderlabs-pos-v2-fe)의 shadcn HSL 토큰을 복제한다.

**Files:**
- Modify: `src/app/globals.css`
- Modify: `tailwind.config.ts`
- Create: `src/lib/colors.ts`

- [ ] **Step 1: globals.css에 토큰 정의**

`src/app/globals.css` 전체를 아래로 교체:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;
  --primary: 222 47% 13.5%;
  --primary-foreground: 210 40% 96%;
  --secondary: 226 100% 94%;
  --secondary-foreground: 226 91% 39%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215 16% 47%;
  --border: 214 32% 91%;
  --ring: 226 91% 39%;
  --destructive: 0 72% 51%;
  --radius: 0.5rem;
}

body { background: hsl(210 40% 98%); color: hsl(var(--foreground)); }
```

- [ ] **Step 2: tailwind.config.ts에 색상 매핑**

`tailwind.config.ts`의 `theme.extend`를 아래로 설정(content 경로는 유지):
```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        border: "hsl(var(--border))",
        ring: "hsl(var(--ring))",
        destructive: "hsl(var(--destructive))",
      },
      borderRadius: { lg: "var(--radius)", md: "calc(var(--radius) - 2px)", sm: "calc(var(--radius) - 4px)" },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 3: colors.ts 팔레트**

Create `src/lib/colors.ts`:
```ts
// 공연 Info에서 고를 수 있는 고정 파스텔 팔레트
export const SHOW_COLORS = [
  "#f4cccc", "#fce5cd", "#fff2cc", "#d9ead3",
  "#d0e0e3", "#cfe2f3", "#d9d2e9", "#f7b6cd",
  "#ead1dc", "#c9daf8", "#b6d7a8", "#ffe599",
] as const;

export const DEFAULT_SHOW_COLOR = SHOW_COLORS[0];
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: shadcn design tokens + show color palette"
```

---

## Task 3: 타입 + Supabase 스키마

**Files:**
- Create: `src/lib/types.ts`
- Create: `supabase/schema.sql`
- Create: `.env.local.example`

- [ ] **Step 1: types.ts**

Create `src/lib/types.ts`:
```ts
export type Room = { id: string; name: string; sort_order: number };

export type Settings = {
  id: number;
  open_time: string;   // 'HH:MM'
  close_time: string;  // 'HH:MM'
  slot_minutes: number;
};

export type Show = {
  id: string;
  title: string;
  color: string;
  capacity: number | null;             // null = 무제한
  default_play_minutes: number | null; // null = 자유
  resource_link: string | null;
};

export type Booking = {
  id: string;
  show_id: string;
  room_id: string;
  date: string;        // 'YYYY-MM-DD'
  start_time: string;  // 'HH:MM'
  duration_minutes: number;
  gm_name: string | null;
};

export type Audience = {
  id: string;
  booking_id: string;
  name: string;
  memo: string | null;
};

// 캘린더 렌더용 조인 결과
export type BookingWithShow = Booking & { show: Show; audience_count: number };
```

- [ ] **Step 2: schema.sql**

Create `supabase/schema.sql`:
```sql
create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order int not null default 0
);

create table if not exists settings (
  id int primary key default 1,
  open_time text not null default '08:00',
  close_time text not null default '23:00',
  slot_minutes int not null default 30,
  constraint settings_singleton check (id = 1)
);

create table if not exists shows (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  color text not null,
  capacity int,
  default_play_minutes int,
  resource_link text,
  created_at timestamptz not null default now()
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  show_id uuid not null references shows(id) on delete cascade,
  room_id uuid not null references rooms(id) on delete cascade,
  date date not null,
  start_time text not null,
  duration_minutes int not null,
  gm_name text,
  created_at timestamptz not null default now()
);

create table if not exists audiences (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  name text not null,
  memo text,
  created_at timestamptz not null default now()
);

-- seed
insert into settings (id) values (1) on conflict (id) do nothing;
insert into rooms (name, sort_order) values ('101호',0),('102호',1),('103호',2)
  on conflict do nothing;
```

- [ ] **Step 3: .env.local.example**

Create `.env.local.example`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...        # 서버 전용
APP_PASSWORD=change-me                   # 단일 공유 비밀번호
AUTH_COOKIE_SECRET=long-random-string    # 쿠키 토큰값
```

- [ ] **Step 4: Supabase 프로젝트에 스키마 적용 (수동)**

사용자가 Supabase 대시보드 SQL Editor에 `supabase/schema.sql` 내용을 붙여 실행한다. (실행 안내만, 코드 작업 아님)

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: db types + supabase schema"
```

---

## Task 4: 순수 스케줄 로직 (TDD)

**Files:**
- Create: `src/lib/schedule.ts`
- Test: `src/lib/schedule.test.ts`
- Create: `vitest.config.ts`

- [ ] **Step 1: vitest 설정**

Create `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: { environment: "jsdom", globals: true },
});
```
`package.json`의 `scripts`에 추가: `"test": "vitest run"`.

- [ ] **Step 2: 실패 테스트 작성**

Create `src/lib/schedule.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import {
  timeToMinutes, minutesToTime, buildTimeSlots,
  slotIndexOf, spanSlots, isFull, weekDates,
} from "./schedule";

describe("time helpers", () => {
  it("converts HH:MM to minutes and back", () => {
    expect(timeToMinutes("08:30")).toBe(510);
    expect(minutesToTime(510)).toBe("08:30");
  });
});

describe("buildTimeSlots", () => {
  it("makes 30-min slots from open to close inclusive of open, exclusive of close", () => {
    const slots = buildTimeSlots("08:00", "10:00", 30);
    expect(slots).toEqual(["08:00", "08:30", "09:00", "09:30"]);
  });
});

describe("slotIndexOf / spanSlots", () => {
  it("finds the row index of a start time", () => {
    const slots = buildTimeSlots("08:00", "23:00", 30);
    expect(slotIndexOf(slots, "14:00")).toBe(12);
  });
  it("computes how many slots a duration spans", () => {
    expect(spanSlots(120, 30)).toBe(4);
    expect(spanSlots(90, 30)).toBe(3);
    expect(spanSlots(45, 30)).toBe(2); // 올림
  });
});

describe("isFull", () => {
  it("returns false when capacity is null (무제한)", () => {
    expect(isFull(99, null)).toBe(false);
  });
  it("returns true when current >= capacity", () => {
    expect(isFull(4, 4)).toBe(true);
    expect(isFull(3, 4)).toBe(false);
  });
});

describe("weekDates", () => {
  it("returns Mon..Sun for a date in that week", () => {
    const dates = weekDates("2026-06-17"); // 수요일
    expect(dates[0]).toBe("2026-06-15"); // 월
    expect(dates[6]).toBe("2026-06-21"); // 일
    expect(dates).toHaveLength(7);
  });
});
```

- [ ] **Step 3: 테스트 실패 확인**

Run: `npm test`
Expected: FAIL — `schedule.ts`의 함수 미구현.

- [ ] **Step 4: schedule.ts 구현**

Create `src/lib/schedule.ts`:
```ts
export function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function buildTimeSlots(open: string, close: string, slot: number): string[] {
  const start = timeToMinutes(open);
  const end = timeToMinutes(close);
  const out: string[] = [];
  for (let t = start; t < end; t += slot) out.push(minutesToTime(t));
  return out;
}

export function slotIndexOf(slots: string[], time: string): number {
  return slots.indexOf(time);
}

export function spanSlots(durationMinutes: number, slot: number): number {
  return Math.ceil(durationMinutes / slot);
}

export function isFull(current: number, capacity: number | null): boolean {
  if (capacity == null) return false;
  return current >= capacity;
}

// 'YYYY-MM-DD'가 속한 주의 월~일 7개 날짜 문자열
export function weekDates(dateStr: string): string[] {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay();              // 0=일..6=토
  const diffToMon = (day + 6) % 7;     // 월요일까지의 거리
  const mon = new Date(d);
  mon.setDate(d.getDate() - diffToMon);
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(mon);
    x.setDate(mon.getDate() + i);
    const yyyy = x.getFullYear();
    const mm = String(x.getMonth() + 1).padStart(2, "0");
    const dd = String(x.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });
}
```

- [ ] **Step 5: 테스트 통과 확인**

Run: `npm test`
Expected: PASS (전체 그린).

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: schedule pure logic with tests"
```

---

## Task 5: Supabase 서버 클라이언트 + 쿼리

**Files:**
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/queries.ts`

- [ ] **Step 1: 서버 클라이언트**

Create `src/lib/supabase/server.ts`:
```ts
import { createClient } from "@supabase/supabase-js";

// 서버 전용. service role key는 클라이언트로 노출 금지.
export function supabaseServer() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
```

- [ ] **Step 2: 쿼리 함수**

Create `src/lib/supabase/queries.ts`:
```ts
import { supabaseServer } from "./server";
import type { Room, Settings, Show, BookingWithShow } from "../types";

export async function getRooms(): Promise<Room[]> {
  const { data } = await supabaseServer().from("rooms").select("*").order("sort_order");
  return data ?? [];
}

export async function getSettings(): Promise<Settings> {
  const { data } = await supabaseServer().from("settings").select("*").eq("id", 1).single();
  return data ?? { id: 1, open_time: "08:00", close_time: "23:00", slot_minutes: 30 };
}

export async function getShows(): Promise<Show[]> {
  const { data } = await supabaseServer().from("shows").select("*").order("title");
  return data ?? [];
}

// 한 주의 bookings + show + 관객수
export async function getBookingsForDates(dates: string[]): Promise<BookingWithShow[]> {
  const { data } = await supabaseServer()
    .from("bookings")
    .select("*, show:shows(*), audiences(count)")
    .in("date", dates);
  return (data ?? []).map((b: any) => ({
    ...b,
    show: b.show,
    audience_count: b.audiences?.[0]?.count ?? 0,
  }));
}

export async function getAudiences(bookingId: string) {
  const { data } = await supabaseServer()
    .from("audiences").select("*").eq("booking_id", bookingId).order("created_at");
  return data ?? [];
}
```

- [ ] **Step 3: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: supabase server client + queries"
```

---

## Task 6: 비밀번호 게이트 (미들웨어 + 로그인)

**Files:**
- Create: `middleware.ts`
- Create: `src/app/login/page.tsx`
- Create: `src/app/login/actions.ts`

- [ ] **Step 1: 로그인 서버 액션**

Create `src/app/login/actions.ts`:
```ts
"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const pw = String(formData.get("password") ?? "");
  if (pw !== process.env.APP_PASSWORD) {
    redirect("/login?error=1");
  }
  cookies().set("auth", process.env.AUTH_COOKIE_SECRET!, {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30,
  });
  redirect("/");
}
```

- [ ] **Step 2: 로그인 페이지**

Create `src/app/login/page.tsx`:
```tsx
import { login } from "./actions";

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <main className="min-h-screen grid place-items-center">
      <form action={login} className="w-80 space-y-3 rounded-xl border border-border bg-white p-6">
        <h1 className="text-lg font-bold">사월점 스케줄</h1>
        <input
          name="password" type="password" placeholder="비밀번호" autoFocus
          className="w-full rounded-md border border-border px-3 py-2 text-sm"
        />
        {searchParams.error && <p className="text-sm text-destructive">비밀번호가 틀렸습니다.</p>}
        <button className="w-full rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">
          입장
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 3: 미들웨어 게이트**

Create `middleware.ts` (프로젝트 루트):
```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/login") || pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }
  const auth = req.cookies.get("auth")?.value;
  if (auth !== process.env.AUTH_COOKIE_SECRET) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
```

- [ ] **Step 4: 수동 검증**

`.env.local`에 `APP_PASSWORD`·`AUTH_COOKIE_SECRET` 설정 후 `npm run dev`. `/`로 가면 `/login` 리다이렉트, 올바른 비번 입력 시 `/` 진입 확인.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: single-password auth gate"
```

---

## Task 7: 서버 액션 (CRUD)

**Files:**
- Create: `src/app/actions.ts`

- [ ] **Step 1: actions.ts 작성**

Create `src/app/actions.ts`:
```ts
"use server";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

// ----- shows -----
export async function createShow(input: {
  title: string; color: string; capacity: number | null;
  default_play_minutes: number | null; resource_link: string | null;
}) {
  await supabaseServer().from("shows").insert(input);
  revalidatePath("/shows"); revalidatePath("/");
}
export async function updateShow(id: string, input: Partial<{
  title: string; color: string; capacity: number | null;
  default_play_minutes: number | null; resource_link: string | null;
}>) {
  await supabaseServer().from("shows").update(input).eq("id", id);
  revalidatePath("/shows"); revalidatePath("/");
}
export async function deleteShow(id: string) {
  await supabaseServer().from("shows").delete().eq("id", id);
  revalidatePath("/shows"); revalidatePath("/");
}

// ----- bookings -----
export async function createBooking(input: {
  show_id: string; room_id: string; date: string;
  start_time: string; duration_minutes: number; gm_name: string | null;
}) {
  await supabaseServer().from("bookings").insert(input);
  revalidatePath("/");
}
export async function updateBooking(id: string, input: Partial<{
  gm_name: string | null; duration_minutes: number;
}>) {
  await supabaseServer().from("bookings").update(input).eq("id", id);
  revalidatePath("/");
}
export async function deleteBooking(id: string) {
  await supabaseServer().from("bookings").delete().eq("id", id);
  revalidatePath("/");
}

// ----- audiences -----
export async function addAudience(input: { booking_id: string; name: string; memo: string | null }) {
  await supabaseServer().from("audiences").insert(input);
  revalidatePath("/");
}
export async function deleteAudience(id: string) {
  await supabaseServer().from("audiences").delete().eq("id", id);
  revalidatePath("/");
}

// ----- settings / rooms -----
export async function updateSettings(input: { open_time: string; close_time: string; slot_minutes: number }) {
  await supabaseServer().from("settings").update(input).eq("id", 1);
  revalidatePath("/"); revalidatePath("/settings");
}
export async function createRoom(name: string, sort_order: number) {
  await supabaseServer().from("rooms").insert({ name, sort_order });
  revalidatePath("/"); revalidatePath("/settings");
}
export async function deleteRoom(id: string) {
  await supabaseServer().from("rooms").delete().eq("id", id);
  revalidatePath("/"); revalidatePath("/settings");
}
```
※ `@/` 별칭이 없으면 상대경로(`../lib/...`)로 변경. tsconfig의 `paths`에 `@/*ote` → `src/*` 설정 권장.

- [ ] **Step 2: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: server actions for crud"
```

---

## Task 8: AppShell + 설정 페이지

**Files:**
- Create: `src/components/AppShell.tsx`
- Create: `src/components/SettingsForm.tsx`
- Create: `src/app/settings/page.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: layout.tsx에 NuqsAdapter**

`src/app/layout.tsx`의 body 내부를 `NuqsAdapter`로 감싼다:
```tsx
import "./globals.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export const metadata = { title: "사월점 스케줄" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body><NuqsAdapter>{children}</NuqsAdapter></body>
    </html>
  );
}
```

- [ ] **Step 2: AppShell**

Create `src/components/AppShell.tsx`:
```tsx
import Link from "next/link";

export function AppShell({ title, action, children }: {
  title: string; action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-52 shrink-0 border-r border-border bg-white p-4">
        <div className="px-2 pb-4 text-base font-bold text-primary">
          사월점 스케줄<span className="block text-[11px] font-normal text-muted-foreground">Season 2</span>
        </div>
        <nav className="space-y-1 text-sm font-medium">
          <Link href="/" className="block rounded-md px-3 py-2 hover:bg-muted">📅 주간 캘린더</Link>
          <Link href="/shows" className="block rounded-md px-3 py-2 hover:bg-muted">🎭 공연 Info</Link>
          <Link href="/settings" className="block rounded-md px-3 py-2 hover:bg-muted">⚙️ 설정</Link>
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-4 border-b border-border bg-white px-6">
          <h1 className="text-sm font-bold">{title}</h1>
          <div className="flex-1" />
          {action}
        </header>
        <main className="flex-1 overflow-auto p-5">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: SettingsForm (클라이언트)**

Create `src/components/SettingsForm.tsx`:
```tsx
"use client";
import { useState } from "react";
import type { Room, Settings } from "@/lib/types";
import { updateSettings, createRoom, deleteRoom } from "@/app/actions";

export function SettingsForm({ settings, rooms }: { settings: Settings; rooms: Room[] }) {
  const [open, setOpen] = useState(settings.open_time);
  const [close, setClose] = useState(settings.close_time);
  const [slot, setSlot] = useState(settings.slot_minutes);
  const [newRoom, setNewRoom] = useState("");

  return (
    <div className="max-w-xl space-y-6">
      <div className="rounded-xl border border-border bg-white p-4 space-y-3">
        <label className="flex items-center gap-3 text-sm">
          <span className="w-24 font-semibold">운영 시작</span>
          <input value={open} onChange={(e) => setOpen(e.target.value)} className="rounded-md border border-border px-2 py-1" />
        </label>
        <label className="flex items-center gap-3 text-sm">
          <span className="w-24 font-semibold">운영 종료</span>
          <input value={close} onChange={(e) => setClose(e.target.value)} className="rounded-md border border-border px-2 py-1" />
        </label>
        <label className="flex items-center gap-3 text-sm">
          <span className="w-24 font-semibold">슬롯(분)</span>
          <input type="number" value={slot} onChange={(e) => setSlot(Number(e.target.value))} className="w-20 rounded-md border border-border px-2 py-1" />
        </label>
        <button
          onClick={() => updateSettings({ open_time: open, close_time: close, slot_minutes: slot })}
          className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">
          저장
        </button>
      </div>

      <div className="rounded-xl border border-border bg-white p-4">
        <div className="mb-3 text-sm font-bold">방 목록</div>
        <div className="flex flex-wrap items-center gap-2">
          {rooms.map((r) => (
            <span key={r.id} className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
              {r.name}
              <button onClick={() => deleteRoom(r.id)} className="opacity-60">✕</button>
            </span>
          ))}
          <input value={newRoom} onChange={(e) => setNewRoom(e.target.value)} placeholder="새 방 이름"
            className="rounded-md border border-border px-2 py-1 text-xs" />
          <button onClick={() => { if (newRoom) { createRoom(newRoom, rooms.length); setNewRoom(""); } }}
            className="rounded-md border border-border px-3 py-1 text-xs font-semibold">+ 추가</button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: settings 페이지**

Create `src/app/settings/page.tsx`:
```tsx
import { AppShell } from "@/components/AppShell";
import { SettingsForm } from "@/components/SettingsForm";
import { getRooms, getSettings } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [settings, rooms] = await Promise.all([getSettings(), getRooms()]);
  return (
    <AppShell title="설정">
      <SettingsForm settings={settings} rooms={rooms} />
    </AppShell>
  );
}
```

- [ ] **Step 5: 타입 체크 + 수동 확인**

Run: `npx tsc --noEmit` → 에러 없음. `npm run dev` 후 `/settings`에서 방 추가/삭제·시간 저장 동작 확인.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: app shell + settings page"
```

---

## Task 9: 공연 Info 페이지 (CRUD)

**Files:**
- Create: `src/components/ShowForm.tsx`
- Create: `src/components/ShowCard.tsx`
- Create: `src/app/shows/page.tsx`

- [ ] **Step 1: ShowCard**

Create `src/components/ShowCard.tsx`:
```tsx
import type { Show } from "@/lib/types";

export function ShowCard({ show, onEdit }: { show: Show; onEdit: () => void }) {
  return (
    <button onClick={onEdit} className="overflow-hidden rounded-xl border border-border bg-white text-left">
      <div className="h-1.5" style={{ background: show.color }} />
      <div className="p-3">
        <h4 className="text-sm font-bold">{show.title}</h4>
        <div className="mt-2 space-y-1 text-[11px] text-muted-foreground">
          <div>정원 <b className="text-foreground">{show.capacity ? `${show.capacity}명` : "무제한"}</b></div>
          <div>기본 플레이타임 <b className="text-foreground">{show.default_play_minutes ? `${show.default_play_minutes}분` : "자유"}</b></div>
          {show.resource_link && <div>📎 자료링크</div>}
        </div>
      </div>
    </button>
  );
}
```

- [ ] **Step 2: ShowForm (생성/수정 모달, 클라이언트)**

Create `src/components/ShowForm.tsx`:
```tsx
"use client";
import { useState } from "react";
import type { Show } from "@/lib/types";
import { SHOW_COLORS, DEFAULT_SHOW_COLOR } from "@/lib/colors";
import { createShow, updateShow, deleteShow } from "@/app/actions";

export function ShowForm({ show, onClose }: { show: Show | null; onClose: () => void }) {
  const [title, setTitle] = useState(show?.title ?? "");
  const [color, setColor] = useState(show?.color ?? DEFAULT_SHOW_COLOR);
  const [capacity, setCapacity] = useState(show?.capacity?.toString() ?? "");
  const [dur, setDur] = useState(show?.default_play_minutes?.toString() ?? "");
  const [link, setLink] = useState(show?.resource_link ?? "");

  async function save() {
    const payload = {
      title, color,
      capacity: capacity ? Number(capacity) : null,
      default_play_minutes: dur ? Number(dur) : null,
      resource_link: link || null,
    };
    if (show) await updateShow(show.id, payload);
    else await createShow(payload);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40" onClick={onClose}>
      <div className="w-96 space-y-3 rounded-xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-base font-bold">{show ? "공연 수정" : "공연 추가"}</h3>
        <Field label="제목"><input value={title} onChange={(e) => setTitle(e.target.value)} className="inp" /></Field>
        <Field label="색상">
          <div className="flex flex-wrap gap-2">
            {SHOW_COLORS.map((c) => (
              <button key={c} onClick={() => setColor(c)} style={{ background: c }}
                className={`h-7 w-7 rounded-md border-2 ${color === c ? "border-foreground" : "border-transparent"}`} />
            ))}
          </div>
        </Field>
        <Field label="정원 (빈칸=무제한)"><input value={capacity} onChange={(e) => setCapacity(e.target.value)} className="inp" /></Field>
        <Field label="기본 플레이타임 분 (빈칸=자유)"><input value={dur} onChange={(e) => setDur(e.target.value)} className="inp" /></Field>
        <Field label="자료링크 (선택)"><input value={link} onChange={(e) => setLink(e.target.value)} className="inp" /></Field>
        <div className="flex justify-between pt-2">
          {show
            ? <button onClick={async () => { await deleteShow(show.id); onClose(); }} className="text-sm text-destructive">삭제</button>
            : <span />}
          <div className="flex gap-2">
            <button onClick={onClose} className="rounded-md border border-border px-3 py-2 text-sm">취소</button>
            <button onClick={save} className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">저장</button>
          </div>
        </div>
      </div>
      <style>{`.inp{width:100%;border:1px solid hsl(var(--border));border-radius:8px;padding:8px 10px;font-size:13px}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-[11px] font-bold text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}
```

- [ ] **Step 3: shows 페이지 (서버 + 클라이언트 래퍼)**

Create `src/app/shows/page.tsx`:
```tsx
import { AppShell } from "@/components/AppShell";
import { getShows } from "@/lib/supabase/queries";
import { ShowsClient } from "@/components/ShowsClient";

export const dynamic = "force-dynamic";

export default async function ShowsPage() {
  const shows = await getShows();
  return (
    <AppShell title="공연 Info">
      <ShowsClient shows={shows} />
    </AppShell>
  );
}
```

Create `src/components/ShowsClient.tsx`:
```tsx
"use client";
import { useState } from "react";
import type { Show } from "@/lib/types";
import { ShowCard } from "./ShowCard";
import { ShowForm } from "./ShowForm";

export function ShowsClient({ shows }: { shows: Show[] }) {
  const [editing, setEditing] = useState<Show | null | "new">(null);
  return (
    <>
      <div className="mb-4 flex justify-end">
        <button onClick={() => setEditing("new")} className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">+ 공연 추가</button>
      </div>
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))" }}>
        {shows.map((s) => <ShowCard key={s.id} show={s} onEdit={() => setEditing(s)} />)}
      </div>
      {editing !== null && (
        <ShowForm show={editing === "new" ? null : editing} onClose={() => setEditing(null)} />
      )}
    </>
  );
}
```

- [ ] **Step 4: 타입 체크 + 수동 확인**

Run: `npx tsc --noEmit`. `npm run dev` → `/shows`에서 공연 추가/수정/삭제, 색상 선택, 정원·플레이타임 빈칸 처리 확인.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: shows info crud page"
```

---

## Task 10: 주간 캘린더 그리드 + 주 이동

**Files:**
- Create: `src/components/WeekNav.tsx`
- Create: `src/components/WeekCalendar.tsx`
- Create: `src/components/CalendarClient.tsx`
- Create: `src/app/page.tsx`

- [ ] **Step 1: WeekNav (nuqs로 주 상태)**

Create `src/components/WeekNav.tsx`:
```tsx
"use client";
import { useQueryState } from "nuqs";
import { weekDates } from "@/lib/schedule";

export function WeekNav({ defaultWeek }: { defaultWeek: string }) {
  const [week, setWeek] = useQueryState("week", { defaultValue: defaultWeek });
  const dates = weekDates(week);
  function shift(days: number) {
    const d = new Date(dates[0] + "T00:00:00");
    d.setDate(d.getDate() + days);
    setWeek(d.toISOString().slice(0, 10));
  }
  return (
    <div className="flex items-center gap-2">
      <button onClick={() => shift(-7)} className="rounded-md border border-border px-2 py-1.5 text-xs">‹</button>
      <span className="px-1 text-sm font-bold">{dates[0]} — {dates[6].slice(5)}</span>
      <button onClick={() => shift(7)} className="rounded-md border border-border px-2 py-1.5 text-xs">›</button>
    </div>
  );
}
```

- [ ] **Step 2: WeekCalendar (그리드 렌더, 클라이언트)**

Create `src/components/WeekCalendar.tsx`:
```tsx
"use client";
import type { Room, Settings, Show, BookingWithShow } from "@/lib/types";
import { buildTimeSlots, slotIndexOf, spanSlots, isFull, weekDates } from "@/lib/schedule";

const DOW = ["월", "화", "수", "목", "금", "토", "일"];
const SLOT_PX = 22;

export function WeekCalendar({
  week, rooms, settings, bookings,
  onEmptyClick, onBlockClick,
}: {
  week: string; rooms: Room[]; settings: Settings; bookings: BookingWithShow[];
  onEmptyClick: (date: string, roomId: string, time: string) => void;
  onBlockClick: (b: BookingWithShow) => void;
}) {
  const dates = weekDates(week);
  const slots = buildTimeSlots(settings.open_time, settings.close_time, settings.slot_minutes);

  // (date|roomId|startTime) -> booking 빠른 조회
  const blockAt = new Map<string, BookingWithShow>();
  for (const b of bookings) blockAt.set(`${b.date}|${b.room_id}|${b.start_time}`, b);

  return (
    <div className="overflow-auto rounded-xl border border-border bg-white">
      <table className="w-full border-collapse" style={{ minWidth: 1100, tableLayout: "fixed" }}>
        <thead>
          <tr>
            <th className="sticky left-0 top-0 z-30 w-12 bg-muted" />
            {dates.map((d, di) => (
              <th key={d} colSpan={rooms.length}
                className={`sticky top-0 z-20 bg-muted py-1.5 text-xs font-bold ${di === 5 ? "text-blue-600" : di === 6 ? "text-red-600" : ""}`}>
                {DOW[di]} {d.slice(8)}
              </th>
            ))}
          </tr>
          <tr>
            <th className="sticky left-0 top-[30px] z-20 bg-muted" />
            {dates.map((d) =>
              rooms.map((r, ri) => (
                <th key={d + r.id}
                  className={`sticky top-[30px] z-10 bg-[hsl(210_40%_98%)] py-1 text-[10.5px] font-semibold text-muted-foreground ${ri === rooms.length - 1 ? "border-r-[2.5px] border-r-[hsl(222_30%_62%)]" : ""}`}>
                  {r.name}
                </th>
              ))
            )}
          </tr>
        </thead>
        <tbody>
          {slots.map((t) => (
            <tr key={t}>
              <td className="sticky left-0 z-10 bg-muted text-center text-[10.5px] font-semibold text-muted-foreground">{t}</td>
              {dates.map((d) =>
                rooms.map((r, ri) => {
                  const b = blockAt.get(`${d}|${r.id}|${t}`);
                  const sep = ri === rooms.length - 1 ? "border-r-[2.5px] border-r-[hsl(222_30%_62%)]" : "";
                  return (
                    <td key={d + r.id + t}
                      onClick={() => !b && onEmptyClick(d, r.id, t)}
                      className={`relative h-[22px] cursor-pointer border border-[hsl(214_32%_94%)] hover:bg-secondary/40 ${sep}`}>
                      {b && <Block b={b} slot={settings.slot_minutes} onClick={() => onBlockClick(b)} />}
                    </td>
                  );
                })
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Block({ b, slot, onClick }: { b: BookingWithShow; slot: number; onClick: () => void }) {
  const span = spanSlots(b.duration_minutes, slot);
  const full = isFull(b.audience_count, b.show.capacity);
  const cap = b.show.capacity
    ? `${b.audience_count}/${b.show.capacity}${full ? " 마감" : ""}`
    : `${b.audience_count}명`;
  return (
    <div onClick={(e) => { e.stopPropagation(); onClick(); }}
      style={{ background: b.show.color, height: span * SLOT_PX - 2 }}
      className="absolute inset-x-[1px] top-[1px] z-10 overflow-hidden rounded-[5px] border-l-[3px] border-l-black/25 px-1 py-0.5 text-[9.5px] leading-tight text-gray-800">
      {b.gm_name && <div className="text-[9px] font-bold opacity-80">GM {b.gm_name}</div>}
      <div className="truncate text-[10px] font-bold">{b.show.title}</div>
      <div className={`text-[8.5px] font-semibold ${full ? "text-red-700" : "opacity-80"}`}>{cap}</div>
    </div>
  );
}
```

- [ ] **Step 3: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음(다음 태스크에서 CalendarClient/page 연결).

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: week calendar grid + week nav"
```

---

## Task 11: 배치 모달 + 상세 패널 + 페이지 조립

**Files:**
- Create: `src/components/PlaceBookingModal.tsx`
- Create: `src/components/BookingPanel.tsx`
- Create: `src/components/AudienceList.tsx`
- Create: `src/components/CalendarClient.tsx`
- Create: `src/app/page.tsx`

- [ ] **Step 1: PlaceBookingModal (자유 플레이타임 분기)**

Create `src/components/PlaceBookingModal.tsx`:
```tsx
"use client";
import { useState } from "react";
import type { Show } from "@/lib/types";
import { createBooking } from "@/app/actions";

export function PlaceBookingModal({
  shows, date, roomId, time, onClose,
}: { shows: Show[]; date: string; roomId: string; time: string; onClose: () => void }) {
  const [showId, setShowId] = useState(shows[0]?.id ?? "");
  const [dur, setDur] = useState("90");
  const [gm, setGm] = useState("");
  const selected = shows.find((s) => s.id === showId);
  const isFree = selected ? selected.default_play_minutes == null : false;

  async function place() {
    if (!selected) return;
    const duration = isFree ? Number(dur) : selected.default_play_minutes!;
    await createBooking({
      show_id: showId, room_id: roomId, date, start_time: time,
      duration_minutes: duration, gm_name: gm || null,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40" onClick={onClose}>
      <div className="w-80 space-y-3 rounded-xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-base font-bold">공연 배치</h3>
        <p className="text-xs text-muted-foreground">{date} · {time} 시작</p>
        <div>
          <div className="mb-1 text-[11px] font-bold text-muted-foreground">공연</div>
          <select value={showId} onChange={(e) => setShowId(e.target.value)} className="w-full rounded-md border border-border px-2 py-2 text-sm">
            {shows.map((s) => <option key={s.id} value={s.id}>{s.title}{s.default_play_minutes == null ? " (자유)" : ""}</option>)}
          </select>
        </div>
        {isFree && (
          <div>
            <div className="mb-1 text-[11px] font-bold text-muted-foreground">플레이타임(분) — 자유 공연</div>
            <input value={dur} onChange={(e) => setDur(e.target.value)} className="w-full rounded-md border border-border px-2 py-2 text-sm" />
          </div>
        )}
        <div>
          <div className="mb-1 text-[11px] font-bold text-muted-foreground">GM (선택)</div>
          <input value={gm} onChange={(e) => setGm(e.target.value)} className="w-full rounded-md border border-border px-2 py-2 text-sm" />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="rounded-md border border-border px-3 py-2 text-sm">취소</button>
          <button onClick={place} className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">배치</button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: AudienceList**

Create `src/components/AudienceList.tsx`:
```tsx
"use client";
import { useState } from "react";
import type { Audience } from "@/lib/types";
import { addAudience, deleteAudience } from "@/app/actions";

export function AudienceList({ bookingId, audiences }: { bookingId: string; audiences: Audience[] }) {
  const [name, setName] = useState("");
  const [memo, setMemo] = useState("");
  return (
    <div>
      {audiences.length === 0
        ? <div className="rounded-md border border-dashed border-border bg-muted p-2 text-center text-xs text-muted-foreground">아직 관객이 없습니다</div>
        : audiences.map((a) => (
          <div key={a.id} className="mb-1.5 flex items-start justify-between rounded-md border border-border p-2">
            <div>
              <div className="text-xs font-bold">{a.name}</div>
              {a.memo && <div className="text-[11px] text-muted-foreground">{a.memo}</div>}
            </div>
            <button onClick={() => deleteAudience(a.id)} className="text-xs text-muted-foreground">✕</button>
          </div>
        ))}
      <div className="mt-2 flex gap-1.5">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="이름" className="w-20 rounded-md border border-border px-2 py-1.5 text-xs" />
        <input value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="메모(후원·결제)" className="flex-1 rounded-md border border-border px-2 py-1.5 text-xs" />
        <button onClick={() => { if (name) { addAudience({ booking_id: bookingId, name, memo: memo || null }); setName(""); setMemo(""); } }}
          className="rounded-md bg-primary px-2 py-1.5 text-xs font-semibold text-primary-foreground">추가</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: BookingPanel**

Create `src/components/BookingPanel.tsx`:
```tsx
"use client";
import { useState } from "react";
import type { Audience, BookingWithShow } from "@/lib/types";
import { isFull } from "@/lib/schedule";
import { updateBooking, deleteBooking } from "@/app/actions";
import { AudienceList } from "./AudienceList";

export function BookingPanel({ booking, audiences, onClose }: {
  booking: BookingWithShow; audiences: Audience[]; onClose: () => void;
}) {
  const [gm, setGm] = useState(booking.gm_name ?? "");
  const full = isFull(audiences.length, booking.show.capacity);
  const capLabel = booking.show.capacity
    ? `${audiences.length} / ${booking.show.capacity}명${full ? " · 마감" : ""}`
    : `${audiences.length}명 · 무제한`;

  return (
    <div className="fixed right-0 top-0 z-50 flex h-screen w-[360px] flex-col border-l border-border bg-white shadow-2xl">
      <div className="flex items-start gap-2.5 border-b border-border p-4">
        <div className="self-stretch w-1.5 rounded" style={{ background: booking.show.color }} />
        <div>
          <h3 className="text-[15px] font-bold">{booking.show.title}</h3>
          <div className="mt-0.5 text-[11.5px] text-muted-foreground">{booking.date} · {booking.start_time} · {booking.duration_minutes}분</div>
        </div>
        <button onClick={onClose} className="ml-auto text-lg text-muted-foreground">✕</button>
      </div>
      <div className="flex-1 space-y-5 overflow-auto p-4">
        <div>
          <div className="mb-1.5 text-[11px] font-bold text-muted-foreground">GM</div>
          <div className="flex gap-1.5">
            <input value={gm} onChange={(e) => setGm(e.target.value)} className="flex-1 rounded-md border border-border px-2 py-1.5 text-sm" />
            <button onClick={() => updateBooking(booking.id, { gm_name: gm || null })}
              className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold">저장</button>
          </div>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold">관객</span>
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${full ? "bg-red-100 text-red-700" : "bg-secondary text-secondary-foreground"}`}>{capLabel}</span>
          </div>
          <AudienceList bookingId={booking.id} audiences={audiences} />
        </div>
        <button onClick={async () => { await deleteBooking(booking.id); onClose(); }}
          className="text-sm text-destructive">이 배치 삭제</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: CalendarClient (상태 조립)**

Create `src/components/CalendarClient.tsx`:
```tsx
"use client";
import { useState } from "react";
import { useQueryState } from "nuqs";
import type { Room, Settings, Show, BookingWithShow, Audience } from "@/lib/types";
import { WeekCalendar } from "./WeekCalendar";
import { PlaceBookingModal } from "./PlaceBookingModal";
import { BookingPanel } from "./BookingPanel";
import { getAudiencesAction } from "@/app/actions";

export function CalendarClient({
  defaultWeek, rooms, settings, shows, bookings,
}: { defaultWeek: string; rooms: Room[]; settings: Settings; shows: Show[]; bookings: BookingWithShow[] }) {
  const [week] = useQueryState("week", { defaultValue: defaultWeek });
  const [placing, setPlacing] = useState<{ date: string; roomId: string; time: string } | null>(null);
  const [panel, setPanel] = useState<{ booking: BookingWithShow; audiences: Audience[] } | null>(null);

  async function openPanel(b: BookingWithShow) {
    const audiences = await getAudiencesAction(b.id);
    setPanel({ booking: b, audiences });
  }

  return (
    <>
      <WeekCalendar week={week} rooms={rooms} settings={settings} bookings={bookings}
        onEmptyClick={(date, roomId, time) => setPlacing({ date, roomId, time })}
        onBlockClick={openPanel} />
      {placing && (
        <PlaceBookingModal shows={shows} date={placing.date} roomId={placing.roomId} time={placing.time}
          onClose={() => setPlacing(null)} />
      )}
      {panel && (
        <BookingPanel booking={panel.booking} audiences={panel.audiences} onClose={() => setPanel(null)} />
      )}
    </>
  );
}
```

`src/app/actions.ts`에 관객 조회 액션 추가(맨 아래):
```ts
export async function getAudiencesAction(bookingId: string) {
  const { data } = await supabaseServer()
    .from("audiences").select("*").eq("booking_id", bookingId).order("created_at");
  return data ?? [];
}
```

- [ ] **Step 5: page.tsx 조립**

Create `src/app/page.tsx`:
```tsx
import { AppShell } from "@/components/AppShell";
import { WeekNav } from "@/components/WeekNav";
import { CalendarClient } from "@/components/CalendarClient";
import { getRooms, getSettings, getShows, getBookingsForDates } from "@/lib/supabase/queries";
import { weekDates } from "@/lib/schedule";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: { week?: string } }) {
  const today = new Date();
  const defaultWeek = searchParams.week ?? today.toISOString().slice(0, 10);
  const dates = weekDates(defaultWeek);
  const [rooms, settings, shows, bookings] = await Promise.all([
    getRooms(), getSettings(), getShows(), getBookingsForDates(dates),
  ]);
  return (
    <AppShell title="주간 캘린더" action={<WeekNav defaultWeek={defaultWeek} />}>
      <CalendarClient defaultWeek={defaultWeek} rooms={rooms} settings={settings} shows={shows} bookings={bookings} />
    </AppShell>
  );
}
```
※ 주 이동 시 서버 데이터 갱신을 위해 `WeekNav`의 `setWeek`는 URL을 바꾸고, page는 `searchParams.week`로 다시 패치한다(nuqs가 URL 갱신 → 서버 컴포넌트 재실행).

- [ ] **Step 6: 타입 체크 + 전체 수동 검증**

Run: `npx tsc --noEmit` → 에러 없음.
`npm run dev` 후 전체 흐름 확인:
1. `/shows`에서 공연 2~3개 등록(정원 있는 것/자유 플레이타임 것 섞기)
2. `/`에서 빈 칸 클릭 → 배치(자유 공연은 시간 입력칸 뜸) → 색상 블록 생성 확인
3. 블록 클릭 → 패널에서 GM 저장, 관객 추가(정원 차면 마감 표시), 삭제
4. 주 이동(‹ ›) → URL `?week=` 갱신 + 데이터 갱신
5. 새로고침 후 데이터 유지

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: booking modal + detail panel + calendar page assembled"
```

---

## Task 12: README + 배포 안내 + GitHub public repo

**Files:**
- Create: `README.md`

- [ ] **Step 1: README 작성**

Create `README.md`:
```markdown
# saweol-schedule

라이브점 시즌2 주간 예약현황 관리 (요일×방 캘린더, 공연 Info, 관객/GM 입력).

## 스택
Next.js 14 · Supabase · Vercel · Tailwind

## 로컬 실행
1. `cp .env.local.example .env.local` 후 값 채우기
2. Supabase SQL Editor에 `supabase/schema.sql` 실행
3. `npm install && npm run dev`

## 환경변수
- `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `APP_PASSWORD` (입장 비번), `AUTH_COOKIE_SECRET` (임의 긴 문자열)

## 배포 (Vercel)
- GitHub 연동 후 위 환경변수 등록 → 자동 배포
```

- [ ] **Step 2: GitHub public repo 생성 + push**

Run:
```bash
cd /Users/baesanghyeog/Desktop/saweol-schedule
gh repo create saweol-schedule --public --source=. --remote=origin --push
```
(gh 인증 필요 시 사용자가 `! gh auth login` 실행)

- [ ] **Step 3: 최종 테스트 + Commit**

Run: `npm test && npx tsc --noEmit`
Expected: 테스트 PASS, 타입 에러 없음.
```bash
git add -A && git commit -m "docs: readme + deploy notes"
git push
```

---

## Self-Review 결과

- **Spec coverage:** 인증(T6), 데이터모델(T3), 방/시간 설정(T8), 공연Info CRUD(T9), 캘린더 그리드+daysep+주이동(T10), 배치/자유플레이타임/정원/GM/관객(T11), 무료배포(T12) — 전부 매핑됨.
- **Placeholder scan:** 모든 코드 스텝에 실제 코드 포함. "수동 적용"은 Supabase 대시보드 작업(코드 아님)으로 명시.
- **Type consistency:** `BookingWithShow.audience_count`, `Show.default_play_minutes`/`capacity`(null 허용), `spanSlots(min, slot)`, `isFull(current, capacity)` 시그니처가 정의(T3/T4)와 사용처(T10/T11)에서 일치.
- 주의: `@/` 경로 별칭은 create-next-app 옵션에 따라 없을 수 있음 → 없으면 tsconfig `paths`에 `"@/*": ["./src/*"]` 추가하거나 상대경로 사용.
