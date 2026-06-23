import { supabaseServer } from "./server";
import type { Room, Gm, Settings, Show, BookingWithShow } from "../types";

export async function getRooms(): Promise<Room[]> {
  const { data } = await supabaseServer().from("rooms").select("*").order("sort_order");
  return data ?? [];
}

export async function getGms(): Promise<Gm[]> {
  const { data } = await supabaseServer().from("gms").select("*").order("sort_order");
  return data ?? [];
}

export async function getSettings(): Promise<Settings> {
  const { data } = await supabaseServer().from("settings").select("*").eq("id", 1).single();
  return data ?? { id: 1, open_time: "08:00", close_time: "23:00", slot_minutes: 30 };
}

export async function getShows(): Promise<Show[]> {
  const { data } = await supabaseServer().from("shows").select("*").order("title");
  return data ?? [];
}

// 여러 날짜의 bookings + show + gm + 관객 명단(결제상태 포함)
export async function getBookingsForDates(dates: string[]): Promise<BookingWithShow[]> {
  interface AudienceRow {
    id: string; name: string; memo: string | null;
    payment_status: string | null; created_at: string;
  }
  interface BookingRow {
    id: string;
    show_id: string;
    room_id: string;
    date: string;
    start_time: string;
    duration_minutes: number;
    gm_id: string | null;
    gm_name: string | null;
    description: string | null;
    show: Show;
    gm: { id: string; name: string } | null;
    audiences: AudienceRow[];
  }
  const { data } = await supabaseServer()
    .from("bookings")
    .select("*, show:shows(*), gm:gms(id,name), audiences(id,name,memo,payment_status,created_at)")
    .in("date", dates);
  return (data as BookingRow[] ?? []).map((b) => {
    const sorted = (b.audiences ?? []).slice().sort((x, y) => x.created_at.localeCompare(y.created_at));
    return {
      ...b,
      show: b.show,
      gm: b.gm,
      audiences: sorted.map((a) => ({
        id: a.id, booking_id: b.id, name: a.name, memo: a.memo, payment_status: a.payment_status,
      })),
      audience_count: sorted.length,
    };
  });
}

export async function getAudiences(bookingId: string) {
  const { data } = await supabaseServer()
    .from("audiences").select("*").eq("booking_id", bookingId).order("created_at");
  return data ?? [];
}
