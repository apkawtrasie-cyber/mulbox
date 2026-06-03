import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

const ALLOWED = new Set(["free", "personal", "business"]);

/** Admin-only: zmiana planu użytkownika. */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle<{ role: string }>();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => ({}))) as { plan_type?: string };
  if (!body.plan_type || !ALLOWED.has(body.plan_type)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }
  const { error } = await supabase.from("profiles").update({ plan_type: body.plan_type }).eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
