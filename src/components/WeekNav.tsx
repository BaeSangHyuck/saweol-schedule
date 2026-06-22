"use client";
import { useQueryState } from "nuqs";
import { weekDates } from "@/lib/schedule";

export function WeekNav({ defaultWeek }: { defaultWeek: string }) {
  const [week, setWeek] = useQueryState("week", { defaultValue: defaultWeek });
  const dates = weekDates(week);
  function shift(days: number) {
    const d = new Date(dates[0] + "T00:00:00");
    d.setDate(d.getDate() + days);
    setWeek(d.toISOString().slice(0, 10));
  }
  return (
    <div className="flex items-center gap-2">
      <button onClick={() => shift(-7)} className="rounded-md border border-border px-2 py-1.5 text-xs">‹</button>
      <span className="px-1 text-sm font-bold">{dates[0]} — {dates[6].slice(5)}</span>
      <button onClick={() => shift(7)} className="rounded-md border border-border px-2 py-1.5 text-xs">›</button>
    </div>
  );
}
