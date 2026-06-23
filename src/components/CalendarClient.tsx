"use client";
import { useState } from "react";
import { useQueryStates, parseAsString, parseAsStringEnum } from "nuqs";
import type { Room, Settings, Show, Gm, BookingWithShow, Audience } from "@/lib/types";
import { monthGrid } from "@/lib/schedule";
import { ScheduleGrid } from "./ScheduleGrid";
import { MonthCalendar } from "./MonthCalendar";
import { CalendarFilter } from "./CalendarFilter";
import { PlaceBookingModal } from "./PlaceBookingModal";
import { BookingPanel } from "./BookingPanel";
import { getAudiencesAction } from "@/app/actions";

export function CalendarClient({
  dates, view, rooms, settings, shows, gms, bookings, isAdmin,
}: {
  dates: string[]; view: "week" | "month"; rooms: Room[]; settings: Settings;
  shows: Show[]; gms: Gm[]; bookings: BookingWithShow[]; isAdmin: boolean;
}) {
  const [{ show, gm }] = useQueryStates({
    show: parseAsString.withDefault(""),
    gm: parseAsString.withDefault(""),
  });
  const [, setNav] = useQueryStates({
    week: parseAsString.withDefault(""),
    view: parseAsStringEnum(["week", "month"]).withDefault("week"),
  }, { shallow: false });
  const [placing, setPlacing] = useState<{ date: string; roomId: string; time: string } | null>(null);
  const [panel, setPanel] = useState<{ booking: BookingWithShow; audiences: Audience[] } | null>(null);

  const filtered = bookings.filter((b) =>
    (!show || b.show_id === show) && (!gm || b.gm_id === gm)
  );

  async function openPanel(b: BookingWithShow) {
    const audiences = await getAudiencesAction(b.id);
    setPanel({ booking: b, audiences });
  }

  return (
    <>
      <CalendarFilter shows={shows} gms={gms} />
      {view === "month" ? (
        <MonthCalendar weeks={monthGrid(dates[0])} bookings={filtered} isAdmin={isAdmin}
          onBlockClick={openPanel}
          onDayClick={(date) => setNav({ week: date, view: "week" })} />
      ) : (
        <ScheduleGrid dates={dates} view="week" rooms={rooms} settings={settings} bookings={filtered} isAdmin={isAdmin}
          onEmptyClick={(date, roomId, time) => { if (isAdmin) setPlacing({ date, roomId, time }); }}
          onBlockClick={openPanel} />
      )}
      {placing && (
        <PlaceBookingModal shows={shows} gms={gms} date={placing.date} roomId={placing.roomId} time={placing.time}
          onClose={() => setPlacing(null)} />
      )}
      {panel && (
        <BookingPanel key={panel.booking.id} booking={panel.booking} audiences={panel.audiences} gms={gms} isAdmin={isAdmin} onClose={() => setPanel(null)} />
      )}
    </>
  );
}
