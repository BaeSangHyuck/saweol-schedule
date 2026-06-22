import { AppShell } from "@/components/AppShell";
import { getShows } from "@/lib/supabase/queries";
import { ShowsClient } from "@/components/ShowsClient";

export const dynamic = "force-dynamic";

export default async function ShowsPage() {
  const shows = await getShows();
  return (
    <AppShell title="공연 Info" admin={true}>
      <ShowsClient shows={shows} />
    </AppShell>
  );
}
