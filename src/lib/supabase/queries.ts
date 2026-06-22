import { supabaseServer } from "./server";
import type { Room, Settings, Show, BookingWithShow } from "../types";

export async function getRooms(): Promise<Room[]> {
  const { data } = await supabaseServer().from("rooms").select("*").order("sort_order");
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

// 한 주의 bookings + show + 관객수
export async function getBookingsForDates(dates: string[]): Promise<BookingWithShow[]> {
  interface BookingRow {
    id: string;
    show_id: string;
    room_id: string;
    date: string;
    start_time: string;
    duration_minutes: number;
    gm_name: string | null;
    show: Show;
    audiences: Array<{ count: number }>;
  }
  const { data } = await supabaseServer()
    .from("bookings")
    .select("*, show:shows(*), audiences(count)")
    .in("date", dates);
  return (data as BookingRow[] ?? []).map((b) => ({
    ...b,
    show: b.show,
    audience_count: b.audiences?.[0]?.count ?? 0,
  }));
}

export async function getAudiences(bookingId: string) {
  const { data } = await supabaseServer()
    .from("audiences").select("*").eq("booking_id", bookingId).order("created_at");
  return data ?? [];
}
