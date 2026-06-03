import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

/** Tworzy nowy formularz dla aktualnie zalogowanego użytkownika. */
export async function POST() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("forms")
    .insert({
      user_id: user.id,
      name: "Nowy formularz",
      is_active: true,
      config: {
        fields: [
          { id: crypto.randomUUID(), type: "text", label: "Imię i nazwisko", name: "name", placeholder: "Jan Kowalski", required: true },
          { id: crypto.randomUUID(), type: "email", label: "Email", name: "email", placeholder: "jan@przyklad.pl", required: true },
          { id: crypto.randomUUID(), type: "textarea", label: "Wiadomość", name: "message", placeholder: "Treść wiadomości…", required: true },
        ],
      },
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ form: data });
}
