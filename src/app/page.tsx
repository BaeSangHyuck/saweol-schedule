import { AppShell } from "@/components/AppShell";
import { CalendarNav } from "@/components/CalendarNav";
import { CalendarClient } from "@/components/CalendarClient";
import { getRooms, getSettings, getShows, getGms, getBookingsForDates } from "@/lib/supabase/queries";
import { weekDates, monthDates } from "@/lib/schedule";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: { week?: string; view?: string } }) {
  const today = new Date();
  const anchor = searchParams.week ?? today.toISOString().slice(0, 10);
  const view = searchParams.view === "month" ? "month" : "week";
  const dates = view === "month" ? monthDates(anchor) : weekDates(anchor);
  const admin = isAdmin();
  const [rooms, settings, shows, gms, bookings] = await Promise.all([
    getRooms(), getSettings(), getShows(), getGms(), getBookingsForDates(dates),
  ]);
  return (
    <AppShell title={view === "month" ? "월간 캘린더" : "주간 캘린더"} admin={admin} action={<CalendarNav defaultWeek={anchor} />}>
      <CalendarClient dates={dates} view={view} rooms={rooms} settings={settings} shows={shows} gms={gms} bookings={bookings} isAdmin={admin} />
    </AppShell>
  );
}
