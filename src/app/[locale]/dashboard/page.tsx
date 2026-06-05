import { createServerSupabase } from "@/lib/supabase-server";
import { requireUser } from "@/lib/auth";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import type { FormRecord, SubmissionRecord } from "@/lib/types";

export default async function DashboardPage() {
  const { profile, userId } = await requireUser();
  const supabase = createServerSupabase();

  const [{ data: forms }, { data: submissions }] = await Promise.all([
    supabase.from("forms").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("submissions").select("*").order("created_at", { ascending: false }).limit(500),
  ]);

  return (
    <DashboardTabs
      profile={profile}
      forms={(forms ?? []) as FormRecord[]}
      submissions={(submissions ?? []) as SubmissionRecord[]}
    />
  );
}
