import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

/** Admin-only: globalne włączenie/wyłączenie formularza. */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle<{ role: string }>();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => ({}))) as { is_active?: boolean };
  const { error } = await supabase.from("forms").update({ is_active: !!body.is_active }).eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
