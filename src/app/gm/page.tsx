import { AppShell } from "@/components/AppShell";
import { getGms } from "@/lib/supabase/queries";
import { GmClient } from "@/components/GmClient";

export const dynamic = "force-dynamic";

export default async function GmPage() {
  const gms = await getGms();
  return (
    <AppShell title="GM 관리" admin={true}>
      <GmClient gms={gms} />
    </AppShell>
  );
}
