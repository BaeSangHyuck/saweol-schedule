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
