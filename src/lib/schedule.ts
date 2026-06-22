export function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function buildTimeSlots(open: string, close: string, slot: number): string[] {
  const start = timeToMinutes(open);
  const end = timeToMinutes(close);
  const out: string[] = [];
  for (let t = start; t < end; t += slot) out.push(minutesToTime(t));
  return out;
}

export function slotIndexOf(slots: string[], time: string): number {
  return slots.indexOf(time);
}

export function spanSlots(durationMinutes: number, slot: number): number {
  return Math.ceil(durationMinutes / slot);
}

export function isFull(current: number, capacity: number | null): boolean {
  if (capacity == null) return false;
  return current >= capacity;
}

// 'YYYY-MM-DD'가 속한 주의 월~일 7개 날짜 문자열
export function weekDates(dateStr: string): string[] {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay();              // 0=일..6=토
  const diffToMon = (day + 6) % 7;     // 월요일까지의 거리
  const mon = new Date(d);
  mon.setDate(d.getDate() - diffToMon);
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(mon);
    x.setDate(mon.getDate() + i);
    const yyyy = x.getFullYear();
    const mm = String(x.getMonth() + 1).padStart(2, "0");
    const dd = String(x.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });
}
