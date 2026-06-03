import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

const ALLOWED_TYPES = new Set(["text", "email", "tel", "textarea", "number"]);

export async function POST(req: Request) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan_type")
    .eq("id", user.id)
    .single();

  if (!profile || profile.plan_type === "free") {
    return NextResponse.json({ error: "Funkcja dostępna tylko w planach Premium." }, { status: 403 });
  }

  const { goal } = await req.json().catch(() => ({})) as { goal?: string };
  if (!goal?.trim()) return NextResponse.json({ error: "Podaj cel formularza." }, { status: 400 });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Brak konfiguracji klucza AI (GEMINI_API_KEY)." }, { status: 500 });

  const prompt = `Jesteś asystentem do budowania formularzy HTML. Użytkownik poda Ci cel formularza.

Zwróć WYŁĄCZNIE tablicę JSON (bez żadnego dodatkowego tekstu, bez markdown, bez komentarzy) zawierającą od 6 do 10 sugerowanych pytań/pól formularza.

Każdy element tablicy musi mieć DOKŁADNIE te klucze:
- "label": string (opis pola, po polsku)
- "type": jeden z: text, email, tel, textarea, number
- "name": string (identyfikator pola, snake_case, po angielsku, bez spacji)
- "placeholder": string (przykładowa wartość lub podpowiedź, po polsku)

Cel formularza: ${goal}

Odpowiedź (tylko JSON array, nic więcej):`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
      }),
    },
  );

  if (!res.ok) {
    const errText = await res.text();
    console.error("[ai] Gemini error:", errText);
    return NextResponse.json({ error: "Błąd API Gemini. Sprawdź klucz GEMINI_API_KEY." }, { status: 502 });
  }

  const data = await res.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  let questions: unknown[];
  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    questions = JSON.parse(cleaned);
  } catch {
    console.error("[ai] JSON parse error, raw:", raw);
    return NextResponse.json({ error: "Nie udało się przetworzyć odpowiedzi AI. Spróbuj ponownie." }, { status: 500 });
  }

  if (!Array.isArray(questions)) {
    return NextResponse.json({ error: "Nieprawidłowy format odpowiedzi AI." }, { status: 500 });
  }

  const normalized = questions
    .map((q: unknown) => {
      const item = q as Record<string, unknown>;
      const type = ALLOWED_TYPES.has(String(item.type)) ? String(item.type) : "text";
      return {
        label: String(item.label ?? "").trim(),
        type,
        name: String(item.name ?? "pole").replace(/\s+/g, "_").replace(/[^a-z0-9_]/gi, ""),
        placeholder: String(item.placeholder ?? ""),
      };
    })
    .filter((q) => q.label.length > 0);

  return NextResponse.json({ questions: normalized });
}
