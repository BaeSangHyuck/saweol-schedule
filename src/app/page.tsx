import { AppShell } from "@/components/AppShell";
import { WeekNav } from "@/components/WeekNav";
import { CalendarClient } from "@/components/CalendarClient";
import { getRooms, getSettings, getShows, getBookingsForDates } from "@/lib/supabase/queries";
import { weekDates } from "@/lib/schedule";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: { week?: string } }) {
  const today = new Date();
  const defaultWeek = searchParams.week ?? today.toISOString().slice(0, 10);
  const dates = weekDates(defaultWeek);
  const admin = isAdmin();
  const [rooms, settings, shows, bookings] = await Promise.all([
    getRooms(), getSettings(), getShows(), getBookingsForDates(dates),
  ]);
  return (
    <AppShell title="주간 캘린더" admin={admin} action={<WeekNav defaultWeek={defaultWeek} />}>
      <CalendarClient defaultWeek={defaultWeek} rooms={rooms} settings={settings} shows={shows} bookings={bookings} isAdmin={admin} />
    </AppShell>
  );
}
