"use server";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

// ----- shows -----
export async function createShow(input: {
  title: string; color: string; capacity: number | null;
  default_play_minutes: number | null; resource_link: string | null;
}) {
  await supabaseServer().from("shows").insert(input);
  revalidatePath("/shows"); revalidatePath("/");
}
export async function updateShow(id: string, input: Partial<{
  title: string; color: string; capacity: number | null;
  default_play_minutes: number | null; resource_link: string | null;
}>) {
  await supabaseServer().from("shows").update(input).eq("id", id);
  revalidatePath("/shows"); revalidatePath("/");
}
export async function deleteShow(id: string) {
  await supabaseServer().from("shows").delete().eq("id", id);
  revalidatePath("/shows"); revalidatePath("/");
}

// ----- bookings -----
export async function createBooking(input: {
  show_id: string; room_id: string; date: string;
  start_time: string; duration_minutes: number; gm_name: string | null;
}) {
  await supabaseServer().from("bookings").insert(input);
  revalidatePath("/");
}
export async function updateBooking(id: string, input: Partial<{
  gm_name: string | null; duration_minutes: number;
}>) {
  await supabaseServer().from("bookings").update(input).eq("id", id);
  revalidatePath("/");
}
export async function deleteBooking(id: string) {
  await supabaseServer().from("bookings").delete().eq("id", id);
  revalidatePath("/");
}

// ----- audiences -----
export async function addAudience(input: { booking_id: string; name: string; memo: string | null }) {
  await supabaseServer().from("audiences").insert(input);
  revalidatePath("/");
}
export async function deleteAudience(id: string) {
  await supabaseServer().from("audiences").delete().eq("id", id);
  revalidatePath("/");
}

// ----- settings / rooms -----
export async function updateSettings(input: { open_time: string; close_time: string; slot_minutes: number }) {
  await supabaseServer().from("settings").update(input).eq("id", 1);
  revalidatePath("/"); revalidatePath("/settings");
}
export async function createRoom(name: string, sort_order: number) {
  await supabaseServer().from("rooms").insert({ name, sort_order });
  revalidatePath("/"); revalidatePath("/settings");
}
export async function deleteRoom(id: string) {
  await supabaseServer().from("rooms").delete().eq("id", id);
  revalidatePath("/"); revalidatePath("/settings");
}

// ----- audiences read (for client panel) -----
export async function getAudiencesAction(bookingId: string) {
  const { data } = await supabaseServer()
    .from("audiences").select("*").eq("booking_id", bookingId).order("created_at");
  return data ?? [];
}
