"use client";
import type { Room, Settings, BookingWithShow } from "@/lib/types";
import { buildTimeSlots, spanSlots, isFull, dowInfo } from "@/lib/schedule";

// 주(week)=7일 / 월(month)=한 달 전체 날짜를 같은 그리드로 렌더.
// week는 크게(보기 편하게), month는 조밀하게.
export function ScheduleGrid({
  dates, rooms, settings, bookings, isAdmin, view,
  onEmptyClick, onBlockClick,
}: {
  dates: string[]; rooms: Room[]; settings: Settings; bookings: BookingWithShow[];
  isAdmin: boolean; view: "week" | "month";
  onEmptyClick: (date: string, roomId: string, time: string) => void;
  onBlockClick: (b: BookingWithShow) => void;
}) {
  const slots = buildTimeSlots(settings.open_time, settings.close_time, settings.slot_minutes);
  const dense = view === "month";
  const slotPx = dense ? 20 : 34;
  const colW = dense ? 38 : 76;

  const blockAt = new Map<string, BookingWithShow>();
  for (const b of bookings) blockAt.set(`${b.date}|${b.room_id}|${b.start_time}`, b);

  return (
    <div className="overflow-auto rounded-xl border border-border bg-white">
      <table className="w-full border-collapse" style={{ minWidth: 48 + dates.length * rooms.length * colW, tableLayout: "fixed" }}>
        <thead>
          <tr>
            <th className="sticky left-0 top-0 z-30 w-12 bg-muted" />
            {dates.map((d) => {
              const { label, isSat, isSun } = dowInfo(d);
              return (
                <th key={d} colSpan={rooms.length}
                  className={`sticky top-0 z-20 border-l border-border bg-muted py-1.5 font-bold ${dense ? "text-[11px]" : "text-sm"} ${isSat ? "text-blue-600" : isSun ? "text-red-600" : ""}`}>
                  {label} {d.slice(8)}
                </th>
              );
            })}
          </tr>
          <tr>
            <th className="sticky left-0 top-[32px] z-20 bg-muted" />
            {dates.map((d) =>
              rooms.map((r, ri) => (
                <th key={d + r.id} style={{ width: colW }}
                  className={`sticky top-[32px] z-10 bg-[hsl(210_40%_98%)] py-1 font-semibold text-muted-foreground ${dense ? "text-[9px]" : "text-[11px]"} ${ri === rooms.length - 1 ? "border-r-[2.5px] border-r-[hsl(222_30%_62%)]" : ""}`}>
                  {r.name}
                </th>
              ))
            )}
          </tr>
        </thead>
        <tbody>
          {slots.map((t) => (
            <tr key={t}>
              <td className={`sticky left-0 z-10 bg-muted text-center font-semibold text-muted-foreground ${dense ? "text-[9.5px]" : "text-[11px]"}`}>{t}</td>
              {dates.map((d) =>
                rooms.map((r, ri) => {
                  const b = blockAt.get(`${d}|${r.id}|${t}`);
                  const sep = ri === rooms.length - 1 ? "border-r-[2.5px] border-r-[hsl(222_30%_62%)]" : "";
                  const clickable = isAdmin && !b ? "cursor-pointer hover:bg-secondary/40" : "";
                  return (
                    <td key={d + r.id + t}
                      onClick={() => !b && onEmptyClick(d, r.id, t)}
                      style={{ height: slotPx }}
                      className={`relative border border-[hsl(214_32%_94%)] ${clickable} ${sep}`}>
                      {b && <Block b={b} slot={settings.slot_minutes} slotPx={slotPx} dense={dense} onClick={() => onBlockClick(b)} />}
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

function Block({ b, slot, slotPx, dense, onClick }: {
  b: BookingWithShow; slot: number; slotPx: number; dense: boolean; onClick: () => void;
}) {
  const span = spanSlots(b.duration_minutes, slot);
  const full = isFull(b.audience_count, b.show.capacity);
  const gmName = b.gm?.name ?? b.gm_name;
  const cap = b.show.capacity
    ? `${b.audience_count}/${b.show.capacity}${full ? " 마감" : ""}`
    : `${b.audience_count}명`;
  return (
    <div onClick={(e) => { e.stopPropagation(); onClick(); }}
      style={{ background: b.show.color, height: span * slotPx - 2 }}
      className="absolute inset-x-[1px] top-[1px] z-10 cursor-pointer overflow-hidden rounded-[5px] border-l-[3px] border-l-black/25 px-1 py-0.5 leading-tight text-gray-800">
      {gmName && <div className={`font-bold opacity-80 ${dense ? "text-[8px]" : "text-[10px]"}`}>GM {gmName}</div>}
      <div className={`truncate font-bold ${dense ? "text-[9px]" : "text-[12px]"}`}>{b.show.title}</div>
      <div className={`font-semibold ${full ? "text-red-700" : "opacity-80"} ${dense ? "text-[8px]" : "text-[10px]"}`}>{cap}</div>
    </div>
  );
}
