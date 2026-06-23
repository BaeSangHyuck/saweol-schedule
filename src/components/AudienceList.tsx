"use client";
import { useState } from "react";
import type { Audience } from "@/lib/types";
import { addAudience, deleteAudience, updateAudience } from "@/app/actions";
import { PAYMENT_STATUSES, paymentBadge } from "@/lib/payment";

export function AudienceList({ bookingId, audiences, isAdmin, capacity, onChanged }: {
  bookingId: string; audiences: Audience[]; isAdmin: boolean; capacity: number | null; onChanged: () => void;
}) {
  const [name, setName] = useState("");
  const [pay, setPay] = useState("");
  const [memo, setMemo] = useState("");

  const atCapacity = capacity != null && audiences.length >= capacity;

  async function add() {
    if (!name || atCapacity) return;
    await addAudience({ booking_id: bookingId, name, memo: memo || null, payment_status: pay || null });
    setName("");
    setPay("");
    setMemo("");
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

  async function setMemoFor(id: string, value: string) {
    await updateAudience(id, { memo: value || null });
    onChanged();
  }

  return (
    <div>
      {audiences.length === 0
        ? <div className="rounded-md border border-dashed border-border bg-muted p-2 text-center text-xs text-muted-foreground">아직 관객이 없습니다</div>
        : audiences.map((a) => {
          const badge = paymentBadge(a.payment_status, a.memo);
          return (
            <div key={a.id} className="mb-1.5 rounded-md border border-border p-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold">{a.name}</span>
                    {badge && <span className={`text-[11px] ${badge.cls}`}>{badge.label}</span>}
                  </div>
                  {a.payment_status !== "예약번호" && a.memo && <div className="text-[11px] text-muted-foreground">{a.memo}</div>}
                </div>
                {isAdmin && (
                  <div className="flex shrink-0 items-center gap-1">
                    <select value={a.payment_status ?? ""} onChange={(e) => setStatus(a.id, e.target.value)}
                      className="rounded border border-border px-1 py-0.5 text-[11px]">
                      <option value="">미정</option>
                      {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button onClick={() => remove(a.id)} className="text-xs text-muted-foreground">✕</button>
                  </div>
                )}
              </div>
              {isAdmin && a.payment_status === "예약번호" && (
                <input key={a.id} defaultValue={a.memo ?? ""} placeholder="예약번호 입력"
                  onBlur={(e) => { if ((e.target.value || "") !== (a.memo ?? "")) setMemoFor(a.id, e.target.value); }}
                  className="mt-1.5 w-full rounded-md border border-border px-2 py-1.5 text-xs" />
              )}
            </div>
          );
        })}
      {isAdmin && (
        atCapacity ? (
          <div className="mt-2 rounded-md border border-dashed border-red-300 bg-red-50 p-2 text-center text-xs font-semibold text-red-600">
            정원이 가득 찼습니다 ({audiences.length}/{capacity})
          </div>
        ) : (
          <div className="mt-2 space-y-1.5">
            <div className="flex gap-1.5">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="이름" className="w-20 rounded-md border border-border px-2 py-1.5 text-xs" />
              <select value={pay} onChange={(e) => setPay(e.target.value)} className="rounded-md border border-border px-2 py-1.5 text-xs">
                <option value="">미정</option>
                {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={add} className="rounded-md bg-primary px-2 py-1.5 text-xs font-semibold text-primary-foreground">추가</button>
            </div>
            {pay === "예약번호" && (
              <input value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="예약번호 입력" className="w-full rounded-md border border-border px-2 py-1.5 text-xs" />
            )}
          </div>
        )
      )}
    </div>
  );
}
