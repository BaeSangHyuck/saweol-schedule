"use client";
import { useState } from "react";
import type { Audience } from "@/lib/types";
import { addAudience, deleteAudience } from "@/app/actions";

export function AudienceList({ bookingId, audiences, isAdmin, onChanged }: {
  bookingId: string; audiences: Audience[]; isAdmin: boolean; onChanged: () => void;
}) {
  const [name, setName] = useState("");
  const [memo, setMemo] = useState("");

  async function add() {
    if (!name) return;
    await addAudience({ booking_id: bookingId, name, memo: memo || null });
    setName("");
    setMemo("");
    onChanged();
  }

  async function remove(id: string) {
    await deleteAudience(id);
    onChanged();
  }

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
            {isAdmin && <button onClick={() => remove(a.id)} className="text-xs text-muted-foreground">✕</button>}
          </div>
        ))}
      {isAdmin && (
        <div className="mt-2 flex gap-1.5">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="이름" className="w-20 rounded-md border border-border px-2 py-1.5 text-xs" />
          <input value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="메모(후원·결제)" className="flex-1 rounded-md border border-border px-2 py-1.5 text-xs" />
          <button onClick={add} className="rounded-md bg-primary px-2 py-1.5 text-xs font-semibold text-primary-foreground">추가</button>
        </div>
      )}
    </div>
  );
}
