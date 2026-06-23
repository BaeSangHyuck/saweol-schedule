"use client";
import { useQueryStates, parseAsString, parseAsStringEnum } from "nuqs";
import { weekDates } from "@/lib/schedule";

export function CalendarNav({ defaultWeek }: { defaultWeek: string }) {
  const [{ week, view }, set] = useQueryStates({
    week: parseAsString.withDefault(defaultWeek),
    view: parseAsStringEnum(["week", "month"]).withDefault("week"),
  }, { shallow: false });

  function shift(dir: number) {
    const d = new Date(week + "T00:00:00");
    if (view === "month") {
      d.setMonth(d.getMonth() + dir, 1);
    } else {
      d.setDate(d.getDate() + dir * 7);
    }
    set({ week: toISO(d) });
  }

  const anchor = new Date(week + "T00:00:00");
  const label = view === "month"
    ? `${anchor.getFullYear()}년 ${anchor.getMonth() + 1}월`
    : `${weekDates(week)[0]} — ${weekDates(week)[6].slice(5)}`;

  return (
    <div className="flex items-center gap-2">
      <div className="flex overflow-hidden rounded-md border border-border text-xs font-semibold">
        <button onClick={() => set({ view: "week" })}
          className={`px-2.5 py-1.5 ${view === "week" ? "bg-primary text-primary-foreground" : "bg-white"}`}>주</button>
        <button onClick={() => set({ view: "month" })}
          className={`px-2.5 py-1.5 ${view === "month" ? "bg-primary text-primary-foreground" : "bg-white"}`}>월</button>
      </div>
      <button onClick={() => shift(-1)} className="rounded-md border border-border px-2 py-1.5 text-xs">‹</button>
      <span className="px-1 text-sm font-bold">{label}</span>
      <button onClick={() => shift(1)} className="rounded-md border border-border px-2 py-1.5 text-xs">›</button>
    </div>
  );
}

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}
