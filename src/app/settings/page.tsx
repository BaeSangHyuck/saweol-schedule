import { AppShell } from "@/components/AppShell";
import { SettingsForm } from "@/components/SettingsForm";
import { getRooms, getSettings } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [settings, rooms] = await Promise.all([getSettings(), getRooms()]);
  return (
    <AppShell title="설정">
      <SettingsForm settings={settings} rooms={rooms} />
    </AppShell>
  );
}
