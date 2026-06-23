"use client";
import { useState } from "react";
import type { Show, Gm } from "@/lib/types";
import { createBooking } from "@/app/actions";

export function PlaceBookingModal({
  shows, gms, date, roomId, time, onClose,
}: { shows: Show[]; gms: Gm[]; date: string; roomId: string; time: string; onClose: () => void }) {
  const [showId, setShowId] = useState(shows[0]?.id ?? "");
  const [dur, setDur] = useState("90");
  const [gmId, setGmId] = useState("");
  const selected = shows.find((s) => s.id === showId);
  const isFree = selected ? selected.default_play_minutes == null : false;

  async function place() {
    if (!selected) return;
    const duration = isFree ? Number(dur) : selected.default_play_minutes!;
    await createBooking({
      show_id: showId, room_id: roomId, date, start_time: time,
      duration_minutes: duration, gm_id: gmId || null,
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
          <select value={gmId} onChange={(e) => setGmId(e.target.value)} className="w-full rounded-md border border-border px-2 py-2 text-sm">
            <option value="">미지정</option>
            {gms.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="rounded-md border border-border px-3 py-2 text-sm">취소</button>
          <button onClick={place} className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">배치</button>
        </div>
      </div>
    </div>
  );
}
