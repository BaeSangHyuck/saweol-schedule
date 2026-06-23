"use client";
import type { BookingWithShow } from "@/lib/types";
import { dowInfo } from "@/lib/schedule";

const HEAD = ["월", "화", "수", "목", "금", "토", "일"];

// 전통적인 달력 레이아웃: 월~일 7열, 주마다 아래로 쌓임. 각 날짜 칸에 그날 예약 칩.
export function MonthCalendar({ weeks, bookings, isAdmin, onBlockClick, onDayClick }: {
  weeks: (string | null)[][];
  bookings: BookingWithShow[];
  isAdmin: boolean;
  onBlockClick: (b: BookingWithShow) => void;
  onDayClick: (date: string) => void;
}) {
  const byDate = new Map<string, BookingWithShow[]>();
  for (const b of bookings) {
    const arr = byDate.get(b.date) ?? [];
    arr.push(b);
    byDate.set(b.date, arr);
  }
  byDate.forEach((arr) => arr.sort((a, b) => a.start_time.localeCompare(b.start_time)));

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white">
      <div className="grid grid-cols-7 border-b border-border bg-muted">
        {HEAD.map((h, i) => (
          <div key={h} className={`py-2 text-center text-xs font-bold ${i === 5 ? "text-blue-600" : i === 6 ? "text-red-600" : "text-muted-foreground"}`}>{h}</div>
        ))}
      </div>
      <div>
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-b border-border last:border-b-0">
            {week.map((d, di) => {
              if (!d) return <div key={di} className="min-h-[112px] border-r border-border bg-[hsl(210_40%_98%)] last:border-r-0" />;
              const info = dowInfo(d);
              const list = byDate.get(d) ?? [];
              return (
                <div key={di}
                  onClick={() => isAdmin && onDayClick(d)}
                  className={`min-h-[112px] border-r border-border p-1 last:border-r-0 ${isAdmin ? "cursor-pointer hover:bg-secondary/20" : ""}`}>
                  <div className={`mb-1 px-0.5 text-xs font-bold ${info.isSat ? "text-blue-600" : info.isSun ? "text-red-600" : "text-foreground"}`}>{Number(d.slice(8))}</div>
                  <div className="space-y-0.5">
                    {list.map((b) => {
                      const needPay = b.audiences.some((a) => a.payment_status === "차액결제");
                      return (
                        <div key={b.id}
                          onClick={(e) => { e.stopPropagation(); onBlockClick(b); }}
                          style={{ background: b.show.color }}
                          className="cursor-pointer truncate rounded px-1 py-0.5 text-[10px] font-semibold leading-tight text-gray-800">
                          <span className="opacity-70">{b.start_time}</span> {b.show.title}
                          {b.description && <span className="opacity-90"> · {b.description}</span>}
                          {needPay && <span className="ml-0.5 font-bold text-red-700">·차액</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
