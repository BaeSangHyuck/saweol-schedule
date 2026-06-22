"use client";
import type { Room, Settings, BookingWithShow } from "@/lib/types";
import { buildTimeSlots, spanSlots, isFull, weekDates } from "@/lib/schedule";

const DOW = ["월", "화", "수", "목", "금", "토", "일"];
const SLOT_PX = 22;

export function WeekCalendar({
  week, rooms, settings, bookings, isAdmin,
  onEmptyClick, onBlockClick,
}: {
  week: string; rooms: Room[]; settings: Settings; bookings: BookingWithShow[]; isAdmin: boolean;
  onEmptyClick: (date: string, roomId: string, time: string) => void;
  onBlockClick: (b: BookingWithShow) => void;
}) {
  const dates = weekDates(week);
  const slots = buildTimeSlots(settings.open_time, settings.close_time, settings.slot_minutes);

  const blockAt = new Map<string, BookingWithShow>();
  for (const b of bookings) blockAt.set(`${b.date}|${b.room_id}|${b.start_time}`, b);

  return (
    <div className="overflow-auto rounded-xl border border-border bg-white">
      <table className="w-full border-collapse" style={{ minWidth: 1100, tableLayout: "fixed" }}>
        <thead>
          <tr>
            <th className="sticky left-0 top-0 z-30 w-12 bg-muted" />
            {dates.map((d, di) => (
              <th key={d} colSpan={rooms.length}
                className={`sticky top-0 z-20 bg-muted py-1.5 text-xs font-bold ${di === 5 ? "text-blue-600" : di === 6 ? "text-red-600" : ""}`}>
                {DOW[di]} {d.slice(8)}
              </th>
            ))}
          </tr>
          <tr>
            <th className="sticky left-0 top-[30px] z-20 bg-muted" />
            {dates.map((d) =>
              rooms.map((r, ri) => (
                <th key={d + r.id}
                  className={`sticky top-[30px] z-10 bg-[hsl(210_40%_98%)] py-1 text-[10.5px] font-semibold text-muted-foreground ${ri === rooms.length - 1 ? "border-r-[2.5px] border-r-[hsl(222_30%_62%)]" : ""}`}>
                  {r.name}
                </th>
              ))
            )}
          </tr>
        </thead>
        <tbody>
          {slots.map((t) => (
            <tr key={t}>
              <td className="sticky left-0 z-10 bg-muted text-center text-[10.5px] font-semibold text-muted-foreground">{t}</td>
              {dates.map((d) =>
                rooms.map((r, ri) => {
                  const b = blockAt.get(`${d}|${r.id}|${t}`);
                  const sep = ri === rooms.length - 1 ? "border-r-[2.5px] border-r-[hsl(222_30%_62%)]" : "";
                  const clickable = isAdmin && !b ? "cursor-pointer hover:bg-secondary/40" : "";
                  return (
                    <td key={d + r.id + t}
                      onClick={() => !b && onEmptyClick(d, r.id, t)}
                      className={`relative h-[22px] border border-[hsl(214_32%_94%)] ${clickable} ${sep}`}>
                      {b && <Block b={b} slot={settings.slot_minutes} onClick={() => onBlockClick(b)} />}
                    </td>
                  );
                })
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Block({ b, slot, onClick }: { b: BookingWithShow; slot: number; onClick: () => void }) {
  const span = spanSlots(b.duration_minutes, slot);
  const full = isFull(b.audience_count, b.show.capacity);
  const cap = b.show.capacity
    ? `${b.audience_count}/${b.show.capacity}${full ? " 마감" : ""}`
    : `${b.audience_count}명`;
  return (
    <div onClick={(e) => { e.stopPropagation(); onClick(); }}
      style={{ background: b.show.color, height: span * SLOT_PX - 2 }}
      className="absolute inset-x-[1px] top-[1px] z-10 cursor-pointer overflow-hidden rounded-[5px] border-l-[3px] border-l-black/25 px-1 py-0.5 text-[9.5px] leading-tight text-gray-800">
      {b.gm_name && <div className="text-[9px] font-bold opacity-80">GM {b.gm_name}</div>}
      <div className="truncate text-[10px] font-bold">{b.show.title}</div>
      <div className={`text-[8.5px] font-semibold ${full ? "text-red-700" : "opacity-80"}`}>{cap}</div>
    </div>
  );
}
