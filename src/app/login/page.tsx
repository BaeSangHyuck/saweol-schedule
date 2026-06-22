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
