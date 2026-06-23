"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "./actions";
import { setClientRole } from "@/lib/clientAuth";

export default function LoginPage() {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const res = await login(pw);
    if (res.ok) {
      setClientRole(res.role);
      router.replace("/");
    } else {
      setError(true);
      setLoading(false);
      setPw("");
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[hsl(222_47%_13.5%)] px-4">
      {/* 배경 장식 */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[hsl(226_91%_39%)]/40 blur-3xl" />
        <div className="absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-[hsl(226_100%_94%)]/20 blur-3xl" />
      </div>

      <form
        onSubmit={onSubmit}
        className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-white/95 p-8 shadow-2xl backdrop-blur"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-xl text-primary-foreground shadow-lg">
            📅
          </div>
          <h1 className="text-xl font-bold text-foreground">사월점 스케줄</h1>
          <p className="mt-1 text-xs text-muted-foreground">Season 2 · 예약 현황 시스템</p>
        </div>

        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">비밀번호</label>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          autoFocus
          placeholder="비밀번호를 입력하세요"
          className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[hsl(226_91%_39%)] focus:ring-2 focus:ring-[hsl(226_91%_39%)]/25"
        />
        {error && <p className="mt-2 text-xs font-medium text-destructive">비밀번호가 올바르지 않습니다.</p>}

        <button
          type="submit"
          disabled={loading || !pw}
          className="mt-5 flex w-full items-center justify-center rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "확인 중…" : "입장하기"}
        </button>

        <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
          마스터는 전체 관리, 게스트는 캘린더 조회만 가능합니다.
        </p>
      </form>
    </main>
  );
}
