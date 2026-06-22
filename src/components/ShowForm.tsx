"use client";
import { useState } from "react";
import type { Show } from "@/lib/types";
import { SHOW_COLORS, DEFAULT_SHOW_COLOR } from "@/lib/colors";
import { createShow, updateShow, deleteShow } from "@/app/actions";

export function ShowForm({ show, onClose }: { show: Show | null; onClose: () => void }) {
  const [title, setTitle] = useState(show?.title ?? "");
  const [color, setColor] = useState(show?.color ?? DEFAULT_SHOW_COLOR);
  const [capacity, setCapacity] = useState(show?.capacity?.toString() ?? "");
  const [dur, setDur] = useState(show?.default_play_minutes?.toString() ?? "");
  const [link, setLink] = useState(show?.resource_link ?? "");

  async function save() {
    const payload = {
      title, color,
      capacity: capacity ? Number(capacity) : null,
      default_play_minutes: dur ? Number(dur) : null,
      resource_link: link || null,
    };
    if (show) await updateShow(show.id, payload);
    else await createShow(payload);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40" onClick={onClose}>
      <div className="w-96 space-y-3 rounded-xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-base font-bold">{show ? "공연 수정" : "공연 추가"}</h3>
        <Field label="제목"><input value={title} onChange={(e) => setTitle(e.target.value)} className="inp" /></Field>
        <Field label="색상">
          <div className="flex flex-wrap gap-2">
            {SHOW_COLORS.map((c) => (
              <button key={c} onClick={() => setColor(c)} style={{ background: c }}
                className={`h-7 w-7 rounded-md border-2 ${color === c ? "border-foreground" : "border-transparent"}`} />
            ))}
          </div>
        </Field>
        <Field label="정원 (빈칸=무제한)"><input value={capacity} onChange={(e) => setCapacity(e.target.value)} className="inp" /></Field>
        <Field label="기본 플레이타임 분 (빈칸=자유)"><input value={dur} onChange={(e) => setDur(e.target.value)} className="inp" /></Field>
        <Field label="자료링크 (선택)"><input value={link} onChange={(e) => setLink(e.target.value)} className="inp" /></Field>
        <div className="flex justify-between pt-2">
          {show
            ? <button onClick={async () => { await deleteShow(show.id); onClose(); }} className="text-sm text-destructive">삭제</button>
            : <span />}
          <div className="flex gap-2">
            <button onClick={onClose} className="rounded-md border border-border px-3 py-2 text-sm">취소</button>
            <button onClick={save} className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">저장</button>
          </div>
        </div>
      </div>
      <style>{`.inp{width:100%;border:1px solid hsl(var(--border));border-radius:8px;padding:8px 10px;font-size:13px}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-[11px] font-bold text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}
