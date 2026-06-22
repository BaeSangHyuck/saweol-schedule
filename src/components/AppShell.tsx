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
