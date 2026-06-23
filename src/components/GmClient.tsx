"use client";
import { useState } from "react";
import type { Gm } from "@/lib/types";
import { createGm, deleteGm } from "@/app/actions";

export function GmClient({ gms }: { gms: Gm[] }) {
  const [name, setName] = useState("");

  return (
    <div className="max-w-xl space-y-4">
      <div className="rounded-xl border border-border bg-white p-4">
        <div className="mb-3 text-sm font-bold">GM 목록</div>
        <div className="flex flex-wrap items-center gap-2">
          {gms.map((g) => (
            <span key={g.id} className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
              {g.name}
              <button onClick={() => deleteGm(g.id)} className="opacity-60">✕</button>
            </span>
          ))}
          {gms.length === 0 && <span className="text-xs text-muted-foreground">아직 등록된 GM이 없습니다.</span>}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="새 GM 이름"
            className="rounded-md border border-border px-2 py-1.5 text-sm" />
          <button onClick={() => { if (name.trim()) { createGm(name.trim(), gms.length); setName(""); } }}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground">+ 추가</button>
        </div>
      </div>
    </div>
  );
}
