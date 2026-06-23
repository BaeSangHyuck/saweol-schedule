"use client";
import { useQueryStates, parseAsString } from "nuqs";
import type { Gm, Show } from "@/lib/types";

export function CalendarFilter({ shows, gms }: { shows: Show[]; gms: Gm[] }) {
  const [{ show, gm }, set] = useQueryStates({
    show: parseAsString.withDefault(""),
    gm: parseAsString.withDefault(""),
  });

  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <span className="text-xs font-bold text-muted-foreground">필터</span>
      <select value={show} onChange={(e) => set({ show: e.target.value || null })}
        className="rounded-md border border-border bg-white px-2 py-1.5 text-xs">
        <option value="">공연 전체</option>
        {shows.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
      </select>
      <select value={gm} onChange={(e) => set({ gm: e.target.value || null })}
        className="rounded-md border border-border bg-white px-2 py-1.5 text-xs">
        <option value="">GM 전체</option>
        {gms.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
      </select>
      {(show || gm) && (
        <button onClick={() => set({ show: null, gm: null })}
          className="text-xs text-muted-foreground underline">초기화</button>
      )}
    </div>
  );
}
