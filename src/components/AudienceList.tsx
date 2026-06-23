"use client";
import { useState } from "react";
import type { Audience } from "@/lib/types";
import { addAudience, deleteAudience, updateAudience } from "@/app/actions";
import { PAYMENT_STATUSES, paymentBadge } from "@/lib/payment";

export function AudienceList({ bookingId, audiences, isAdmin, onChanged }: {
  bookingId: string; audiences: Audience[]; isAdmin: boolean; onChanged: () => void;
}) {
  const [name, setName] = useState("");
  const [memo, setMemo] = useState("");
  const [pay, setPay] = useState("");

  async function add() {
    if (!name) return;
    await addAudience({ booking_id: bookingId, name, memo: memo || null, payment_status: pay || null });
    setName("");
    setMemo("");
    setPay("");
    onChanged();
  }

  async function remove(id: string) {
    await deleteAudience(id);
    onChanged();
  }

  async function setStatus(id: string, status: string) {
    await updateAudience(id, { payment_status: status || null });
    onChanged();
  }

  return (
    <div>
      {audiences.length === 0
        ? <div className="rounded-md border border-dashed border-border bg-muted p-2 text-center text-xs text-muted-foreground">아직 관객이 없습니다</div>
        : audiences.map((a) => {
          const badge = paymentBadge(a.payment_status);
          return (
            <div key={a.id} className="mb-1.5 flex items-start justify-between gap-2 rounded-md border border-border p-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold">{a.name}</span>
                  {badge && <span className={`text-[10px] ${badge.cls}`}>{badge.label}</span>}
                </div>
                {a.memo && <div className="text-[11px] text-muted-foreground">{a.memo}</div>}
              </div>
              {isAdmin && (
                <div className="flex shrink-0 items-center gap-1">
                  <select value={a.payment_status ?? ""} onChange={(e) => setStatus(a.id, e.target.value)}
                    className="rounded border border-border px-1 py-0.5 text-[10px]">
                    <option value="">미정</option>
                    {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={() => remove(a.id)} className="text-xs text-muted-foreground">✕</button>
                </div>
              )}
            </div>
          );
        })}
      {isAdmin && (
        <div className="mt-2 space-y-1.5">
          <div className="flex gap-1.5">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="이름" className="w-20 rounded-md border border-border px-2 py-1.5 text-xs" />
            <select value={pay} onChange={(e) => setPay(e.target.value)} className="rounded-md border border-border px-2 py-1.5 text-xs">
              <option value="">미정</option>
              {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={add} className="rounded-md bg-primary px-2 py-1.5 text-xs font-semibold text-primary-foreground">추가</button>
          </div>
          <input value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="메모(선택)" className="w-full rounded-md border border-border px-2 py-1.5 text-xs" />
        </div>
      )}
    </div>
  );
}