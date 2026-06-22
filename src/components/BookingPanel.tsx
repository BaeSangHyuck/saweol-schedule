"use client";
import { useState } from "react";
import type { Audience, BookingWithShow } from "@/lib/types";
import { isFull } from "@/lib/schedule";
import { updateBooking, deleteBooking, getAudiencesAction } from "@/app/actions";
import { AudienceList } from "./AudienceList";

export function BookingPanel({ booking, audiences: initialAudiences, onClose }: {
  booking: BookingWithShow; audiences: Audience[]; onClose: () => void;
}) {
  const [gm, setGm] = useState(booking.gm_name ?? "");
  const [audiences, setAudiences] = useState<Audience[]>(initialAudiences);

  async function refreshAudiences() {
    const next = await getAudiencesAction(booking.id);
    setAudiences(next);
  }

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
          <AudienceList bookingId={booking.id} audiences={audiences} onChanged={refreshAudiences} />
        </div>
        <button onClick={async () => { await deleteBooking(booking.id); onClose(); }}
          className="text-sm text-destructive">이 배치 삭제</button>
      </div>
    </div>
  );
}
