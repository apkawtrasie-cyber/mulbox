import { notFound } from "next/navigation";
import { createServiceSupabase } from "@/lib/supabase-server";
import type { FormRecord } from "@/lib/types";
import PublicForm from "./PublicForm";
import ConversationalForm from "./ConversationalForm";

interface PageProps { params: { formId: string } }

export const revalidate = 0;

export async function generateMetadata({ params }: PageProps) {
  const supabase = createServiceSupabase();
  const { data } = await supabase.from("forms").select("name, config").eq("id", params.formId).maybeSingle();
  return { title: (data?.name as string) ?? "Formularz", robots: { index: false, follow: false } };
}

/** Publiczna strona formularza – minimalistyczna, w 100% responsywna. */
export default async function FormPage({ params }: PageProps) {
  const supabase = createServiceSupabase();
  const { data } = await supabase
    .from("forms")
    .select("*")
    .eq("id", params.formId)
    .maybeSingle<FormRecord>();

  if (!data || !data.is_active) notFound();

  const isConversational = data.config?.form_type === "conversational";
  const title = data.config?.formpage_title || data.name;
  // W trybie konwersacyjnym nie pokazujemy domyślnego (polskiego) podpisu –
  // powitanie jest w środku widżetu, w wybranym języku.
  const desc = data.config?.formpage_description || (isConversational ? "" : "Wypełnij formularz, a odezwiemy się do Ciebie.");
  const submitLabel = data.config?.submit_label || "Wyślij wiadomość";
  const siteKey = data.recaptcha_site_key ?? process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";
  const logoUrl = data.config?.formpage_logo_url;
  const bgColor = data.config?.formpage_bg_color ?? "#f8fafc";
  const accentColor = data.config?.formpage_accent_color ?? "#7c3aed";
  const footer = data.config?.formpage_footer;
  const wide = data.config?.formpage_wide ?? false;

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: bgColor }}
    >
      <div className={wide ? "w-full max-w-5xl mx-auto px-4" : "w-full max-w-md"}>
        {logoUrl && (
          <div className="flex justify-center mb-6">
            <img src={logoUrl} alt="logo" className="h-16 object-contain" />
          </div>
        )}
        <h1 className="text-3xl font-bold text-slate-900 text-center">{title}</h1>
        {desc && <p className="mt-2 text-center text-slate-600">{desc}</p>}

        {isConversational ? (
          <ConversationalForm
            formId={data.id}
            intro={data.config?.conversation_intro}
            accentColor={accentColor}
            footer={footer}
            siteKey={siteKey}
            lang={data.config?.conversation_lang}
          />
        ) : (
          <PublicForm
            formId={data.id}
            fields={data.config.fields ?? []}
            submitLabel={submitLabel}
            siteKey={siteKey}
            accentColor={accentColor}
            footer={footer}
            wide={wide}
          />
        )}
      </div>
    </main>
  );
}
