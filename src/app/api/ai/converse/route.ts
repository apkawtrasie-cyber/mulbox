import { NextResponse } from "next/server";
import { createServiceSupabase } from "@/lib/supabase-server";
import type { FormRecord } from "@/lib/types";

/**
 * Publiczny endpoint trybu konwersacyjnego.
 * Na podstawie celu formularza (config.conversation_goal) i dotychczasowej
 * historii Q/A AI decyduje: zadać kolejne pytanie czy zakończyć rozmowę
 * i zwrócić streszczenie wszystkich odpowiedzi.
 *
 * Wejście:  { formId: string, history: Array<{ q: string; a: string }> }
 * Wyjście:  { done: false, question: string }
 *        |  { done: true, summary: string }
 */

interface Turn { q: string; a: string }

export async function POST(req: Request) {
  const { formId, history: rawHistory } = (await req.json().catch(() => ({}))) as {
    formId?: string;
    history?: Turn[];
  };

  if (!formId) return NextResponse.json({ error: "Brak formId." }, { status: 400 });

  const history: Turn[] = Array.isArray(rawHistory)
    ? rawHistory.filter((t) => t && typeof t.q === "string" && typeof t.a === "string").slice(0, 30)
    : [];

  const supabase = createServiceSupabase();
  const { data: form } = await supabase
    .from("forms")
    .select("name, is_active, config")
    .eq("id", formId)
    .maybeSingle<Pick<FormRecord, "name" | "is_active" | "config">>();

  if (!form || !form.is_active) {
    return NextResponse.json({ error: "Formularz niedostępny." }, { status: 404 });
  }

  const goal = form.config?.conversation_goal?.trim() || form.name;
  const maxQ = Math.min(Math.max(Number(form.config?.conversation_max ?? 8), 3), 15);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Brak konfiguracji klucza AI." }, { status: 500 });

  // Wymuś zakończenie po osiągnięciu limitu pytań.
  const forceDone = history.length >= maxQ;

  const transcript = history.length
    ? history.map((t, i) => `Pytanie ${i + 1}: ${t.q}\nOdpowiedź ${i + 1}: ${t.a}`).join("\n\n")
    : "(rozmowa jeszcze się nie zaczęła)";

  const prompt = `Jesteś asystentem prowadzącym ankietę/wywiad w imieniu właściciela formularza.
Twoim celem jest zebrać od osoby wypełniającej informacje opisane poniżej, zadając pytania POJEDYNCZO,
naturalnym, uprzejmym językiem polskim. Dopytuj o szczegóły, jeśli to potrzebne. Nie zadawaj kilku pytań naraz.

BARDZO WAŻNE – ZAKAZ POWTÓRZEŃ:
- Najpierw przeczytaj całą dotychczasową rozmowę.
- NIGDY nie pytaj ponownie o informację, którą osoba już podała (nawet innymi słowami).
- Jeśli odpowiedź jest jasna, przyjmij ją i przejdź do KOLEJNEGO, innego tematu.
- Nie proś o potwierdzenie tego, co już potwierdzone. Jeśli wszystkie potrzebne informacje są zebrane – zakończ rozmowę.

CEL ROZMOWY (od właściciela formularza):
${goal}

Dotychczasowa rozmowa:
${transcript}

Limit pytań: ${maxQ}. Zadano dotąd: ${history.length}.
${forceDone ? "Osiągnięto limit pytań – MUSISZ teraz zakończyć rozmowę (done=true)." : ""}

Zwróć WYŁĄCZNIE obiekt JSON (bez markdown, bez komentarzy) w jednym z dwóch formatów:
- aby zadać kolejne pytanie:   {"done": false, "question": "treść pytania po polsku", "options": ["opcja A","opcja B"], "multi": false}
- aby zakończyć rozmowę:        {"done": true, "summary": "zwięzłe streszczenie wszystkich odpowiedzi w punktach, po polsku, gotowe do przeczytania przez właściciela formularza"}

Zasada dla "options" – BARDZO WAŻNE (preferuj gotowe opcje!):
- DOMYŚLNIE proponuj klikalne opcje. Zakładaj, że osoba wypełniająca jest laikiem i NIE zna fachowych pojęć – nie każ jej pisać z głowy, tylko podaj konkretne możliwości do zaznaczenia.
- Przy pytaniach technicznych/specjalistycznych (np. funkcje skrzynki mailowej, hosting, parametry, style, zakres usług) ZAWSZE rozłóż temat na 4–8 konkretnych, zrozumiałych opcji (np. "Dużo miejsca na pocztę", "Własna domena w adresie", "Kalendarz i kontakty", "Ochrona antyspamowa", "Dostęp z telefonu", "Wsparcie techniczne").
- Ustaw "multi": true zawsze, gdy realnie można wybrać kilka rzeczy naraz (a przy funkcjach/preferencjach prawie zawsze można).
- Zadawaj raczej węższe, szczegółowe pytania z opcjami niż jedno szerokie, otwarte pytanie. Lepiej rozbić temat na kilka klikalnych pytań.
- Tylko gdy odpowiedź jest z natury unikalna i opisowa (np. nazwa firmy, konkretny adres, własny opis pomysłu) – pomiń "options" i pozwól wpisać tekst.
- Możesz dodać jako ostatnią opcję "Inne" lub "Nie wiem / podpowiedzcie", gdy to pomaga.

Zakończ (done=true), gdy masz już wystarczająco informacji, by zrealizować cel, lub gdy osiągnięto limit pytań.
Odpowiedź (tylko JSON):`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 1024,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    },
  );

  if (!res.ok) {
    const errText = await res.text();
    console.error("[converse] Gemini error", res.status, errText);
    if (res.status === 429) {
      return NextResponse.json(
        { error: "Chwilowo zbyt wiele zapytań do AI. Spróbuj za chwilę." },
        { status: 429 },
      );
    }
    return NextResponse.json({ error: `Błąd AI (${res.status}).` }, { status: 502 });
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string; thought?: boolean }> } }>;
  };
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  const raw = parts
    .filter((p) => !p.thought)
    .map((p) => p.text ?? "")
    .join("")
    .trim();

  let parsed: { done?: boolean; question?: string; summary?: string; options?: unknown; multi?: boolean };
  try {
    parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
  } catch {
    console.error("[converse] JSON parse error, raw:", raw);
    return NextResponse.json({ error: "Nie udało się przetworzyć odpowiedzi AI." }, { status: 500 });
  }

  if (forceDone || parsed.done) {
    const summary = String(parsed.summary ?? "").trim() || "(AI nie wygenerowało streszczenia)";
    return NextResponse.json({ done: true, summary });
  }

  const question = String(parsed.question ?? "").trim();
  if (!question) {
    return NextResponse.json({ done: true, summary: "(brak dalszych pytań)" });
  }
  const options = Array.isArray(parsed.options)
    ? parsed.options.map((o) => String(o).trim()).filter(Boolean).slice(0, 8)
    : [];
  return NextResponse.json({
    done: false,
    question,
    options,
    multi: options.length > 0 ? Boolean(parsed.multi) : false,
  });
}
