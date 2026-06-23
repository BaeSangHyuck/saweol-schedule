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

// 'YYYY-MM-DD'가 속한 달의 1일~말일 전체 날짜 문자열
export function monthDates(dateStr: string): string[] {
  const d = new Date(dateStr + "T00:00:00");
  const y = d.getFullYear();
  const m = d.getMonth();
  const last = new Date(y, m + 1, 0).getDate();
  const mm = String(m + 1).padStart(2, "0");
  return Array.from({ length: last }, (_, i) => `${y}-${mm}-${String(i + 1).padStart(2, "0")}`);
}

// 한 달을 월~일 주 단위로 묶은 그리드. 앞뒤 빈칸은 null.
export function monthGrid(dateStr: string): (string | null)[][] {
  const days = monthDates(dateStr);
  const first = new Date(days[0] + "T00:00:00");
  const lead = (first.getDay() + 6) % 7; // 월요일 시작 기준 앞쪽 빈칸 수
  const cells: (string | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  cells.push(...days);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

// 날짜의 요일 라벨/주말 여부 (토=파랑, 일=빨강)
const DOW_LABEL = ["일", "월", "화", "수", "목", "금", "토"];
export function dowInfo(dateStr: string): { label: string; isSat: boolean; isSun: boolean } {
  const day = new Date(dateStr + "T00:00:00").getDay();
  return { label: DOW_LABEL[day], isSat: day === 6, isSun: day === 0 };
}
