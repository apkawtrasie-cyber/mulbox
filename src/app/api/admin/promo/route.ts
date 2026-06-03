import { NextResponse } from "next/server";
import { createServiceSupabase } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const seg = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `MULBOX-${seg(4)}-${seg(4)}`;
}

export async function POST(req: Request) {
  await requireAdmin();
  const service = createServiceSupabase();

  const body = (await req.json().catch(() => ({}))) as {
    plan_type?: string;
    duration_days?: number;
    max_uses?: number;
    count?: number;
  };

  const planType = body.plan_type ?? "business";
  const durationDays = Number(body.duration_days ?? 7);
  const maxUses = Number(body.max_uses ?? 1);
  const count = Math.min(Number(body.count ?? 1), 50);

  const codes = Array.from({ length: count }, () => ({
    code: generateCode(),
    plan_type: planType,
    duration_days: durationDays,
    max_uses: maxUses,
  }));

  const { data, error } = await service.from("promo_codes").insert(codes).select("code");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, codes: data?.map((r: { code: string }) => r.code) ?? [] });
}

export async function GET() {
  await requireAdmin();
  const service = createServiceSupabase();
  const { data } = await service
    .from("promo_codes")
    .select("id, code, plan_type, duration_days, max_uses, used_count, is_active, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return NextResponse.json({ codes: data ?? [] });
}

export async function DELETE(req: Request) {
  await requireAdmin();
  const { id } = (await req.json().catch(() => ({}))) as { id?: string };
  if (!id) return NextResponse.json({ error: "Brak id" }, { status: 400 });
  const service = createServiceSupabase();
  await service.from("promo_codes").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
