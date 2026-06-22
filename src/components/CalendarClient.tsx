"use client";
import { useState } from "react";
import { useQueryState } from "nuqs";
import type { Room, Settings, Show, BookingWithShow, Audience } from "@/lib/types";
import { WeekCalendar } from "./WeekCalendar";
import { PlaceBookingModal } from "./PlaceBookingModal";
import { BookingPanel } from "./BookingPanel";
import { getAudiencesAction } from "@/app/actions";

export function CalendarClient({
  defaultWeek, rooms, settings, shows, bookings,
}: { defaultWeek: string; rooms: Room[]; settings: Settings; shows: Show[]; bookings: BookingWithShow[] }) {
  const [week] = useQueryState("week", { defaultValue: defaultWeek, shallow: false });
  const [placing, setPlacing] = useState<{ date: string; roomId: string; time: string } | null>(null);
  const [panel, setPanel] = useState<{ booking: BookingWithShow; audiences: Audience[] } | null>(null);

  async function openPanel(b: BookingWithShow) {
    const audiences = await getAudiencesAction(b.id);
    setPanel({ booking: b, audiences });
  }

  return (
    <>
      <WeekCalendar week={week} rooms={rooms} settings={settings} bookings={bookings}
        onEmptyClick={(date, roomId, time) => setPlacing({ date, roomId, time })}
        onBlockClick={openPanel} />
      {placing && (
        <PlaceBookingModal shows={shows} date={placing.date} roomId={placing.roomId} time={placing.time}
          onClose={() => setPlacing(null)} />
      )}
      {panel && (
        <BookingPanel booking={panel.booking} audiences={panel.audiences} onClose={() => setPanel(null)} />
      )}
    </>
  );
}
