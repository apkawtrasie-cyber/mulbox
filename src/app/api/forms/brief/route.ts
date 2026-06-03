import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

const PODSTAWOWY_FIELDS = [
  { type: "text",     label: "Imię i nazwisko",  name: "name",        placeholder: "Jan Kowalski",              required: true },
  { type: "text",     label: "Nazwa firmy",     name: "company",     placeholder: "Firma Sp. z o.o." },
  { type: "text",     label: "Adres",           name: "address",     placeholder: "ul. Przykładowa 1, Warszawa" },
  { type: "email",    label: "E-mail",          name: "email",       placeholder: "jan@firma.pl",               required: true },
  { type: "tel",      label: "Telefon",         name: "phone",       placeholder: "+48 123 456 789" },
  { type: "textarea", label: "Wiadomość",       name: "message",     placeholder: "Opisz swoje zapytanie…",      required: true },
  { type: "file",     label: "Załączniki / zdjęcia", name: "attachments" },
];

const WYCENA_FIELDS = [
  { type: "text",     label: "Imię i nazwisko",                   name: "name",         placeholder: "Jan Kowalski",                                    required: true },
  { type: "email",    label: "Email kontaktowy",                   name: "email",        placeholder: "jan@firma.pl",                                    required: true },
  { type: "tel",      label: "Telefon",                            name: "phone",        placeholder: "+48 123 456 789" },
  { type: "text",     label: "Nazwa firmy / projekt",              name: "company",      placeholder: "Moja Firma Sp. z o.o." },
  { type: "text",     label: "Rodzaj usługi",                      name: "service_type", placeholder: "Np. Strona internetowa, Logo, Kampania…" },
  { type: "textarea", label: "Opis projektu",                      name: "description",  placeholder: "Opisz swój projekt, cele i oczekiwania…",          required: true },
  { type: "text",     label: "Szacowany budżet",                   name: "budget",       placeholder: "Np. 5 000 – 15 000 zł" },
  { type: "date",     label: "Termin realizacji",                  name: "deadline" },
  { type: "file",     label: "Zdjęcia / materiały referencyjne",   name: "attachments" },
  { type: "textarea", label: "Dodatkowe informacje",               name: "extra",        placeholder: "Cokolwiek jeszcze chcesz nam przekazać…" },
];

const ANKIETA_FIELDS = [
  { type: "text",     label: "Imię i nazwisko",                    name: "name",        placeholder: "Jan Kowalski" },
  { type: "email",    label: "Email",                              name: "email",       placeholder: "jan@przyklad.pl" },
  { type: "text",     label: "Skąd nas znasz?",                    name: "source",      placeholder: "Google, Instagram, polecenie…" },
  { type: "number",   label: "Ocena współpracy (1–10)",            name: "rating",      placeholder: "10",                              required: true },
  { type: "textarea", label: "Co najbardziej Ci się podobało?",    name: "positive",    placeholder: "Opisz mocne strony…" },
  { type: "textarea", label: "Co możemy poprawić?",                name: "improvement", placeholder: "Twoje sugestie…" },
  { type: "text",     label: "Czy polecisz nas znajomym?",         name: "recommend",   placeholder: "Tak / Nie / Może" },
  { type: "textarea", label: "Dodatkowe uwagi",                    name: "extra",       placeholder: "Inne przemyślenia…" },
];

export async function POST(req: Request) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { template = "podstawowy" } = await req.json().catch(() => ({})) as { template?: string };

  const CONFIGS: Record<string, {
    fields: typeof PODSTAWOWY_FIELDS;
    name: string;
    title: string;
    description: string;
    submit_label: string;
  }> = {
    podstawowy: {
      fields: PODSTAWOWY_FIELDS,
      name: "Brief (podstawowy)",
      title: "Wyślij zapytanie",
      description: "Wypełnij formularz, a odezwiemy się do Ciebie najszybciej jak to możliwe.",
      submit_label: "Wyślij zapytanie",
    },
    wycena: {
      fields: WYCENA_FIELDS,
      name: "Brief / Zapytanie ofertowe",
      title: "Wyślij brief",
      description: "Opisz swój projekt, a przygotujemy dla Ciebie wycenę w ciągu 24h.",
      submit_label: "Wyślij brief",
    },
    ankieta: {
      fields: ANKIETA_FIELDS,
      name: "Ankieta satysfakcji",
      title: "Ankieta satysfakcji",
      description: "Twoja opinia jest dla nas ważna. Zajmie to tylko chwilę.",
      submit_label: "Wyślij odpowiedzi",
    },
  };

  const cfg = CONFIGS[template] ?? CONFIGS.podstawowy;
  const fields = cfg.fields.map((f) => ({ ...f, id: crypto.randomUUID() }));

  const { data, error } = await supabase
    .from("forms")
    .insert({
      user_id: user.id,
      name: cfg.name,
      is_active: true,
      config: {
        fields,
        form_type: "brief",
        formpage_wide: true,
        formpage_title: cfg.title,
        formpage_description: cfg.description,
        submit_label: cfg.submit_label,
      },
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ form: data });
}
