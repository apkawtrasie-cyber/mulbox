import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { createServiceSupabase } from "@/lib/supabase-server";

interface PageProps { params: { formId: string } }

export const revalidate = 60;

export async function generateMetadata() {
  return { title: "Dziękujemy! – Mulbox", robots: { index: false, follow: false } };
}

export default async function SuccessPage({ params }: PageProps) {
  const supabase = createServiceSupabase();
  const { data: form } = await supabase
    .from("forms")
    .select("name")
    .eq("id", params.formId)
    .maybeSingle();

  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="text-emerald-500" size={44} strokeWidth={1.5} />
        </div>

        <h1 className="mt-6 text-3xl font-bold text-slate-900">Dziękujemy!</h1>
        <p className="mt-3 text-slate-600">
          Twoja wiadomość{form?.name ? ` do formularza „${form.name}"` : ""} została
          pomyślnie wysłana. Odezwiemy się najszybciej jak to możliwe.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={`/p/${params.formId}`} className="btn-secondary">
            ← Wróć do formularza
          </Link>
          <Link href="/" className="btn-ghost text-slate-500">
            Mulbox.ch
          </Link>
        </div>

        <p className="mt-10 text-xs text-slate-400">
          Powered by{" "}
          <a href="https://mulbox.ch" className="underline hover:text-brand-600">
            Mulbox.ch
          </a>
        </p>
      </div>
    </main>
  );
}
