"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Copy, Check, Sparkles } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import ConversationalForm from "@/app/p/[formId]/ConversationalForm";

interface Strings {
  eyebrow: string;
  heading: string;
  subtitle: string;
  leftTitle: string;
  leftText: string;
  codeLabel: string;
  copy: string;
  copied: string;
  cta: string;
}

const T: Record<string, Strings> = {
  pl: {
    eyebrow: "Demo na żywo",
    heading: "Wypróbuj formularz, który rozmawia",
    subtitle: "Po prawej masz prawdziwy formularz Mulbox w trybie rozmowy. Odpowiedz na kilka pytań i zobacz, jak zbiera informacje za Ciebie.",
    leftTitle: "Tak działa to u Ciebie",
    leftText: "Zamiast pustych pól klient prowadzi krótką rozmowę, a Ty dostajesz gotowe streszczenie na maila (i PDF). Osadzisz go na swojej stronie jednym kodem:",
    codeLabel: "Wklej ten kod na swojej stronie:",
    copy: "Kopiuj",
    copied: "Skopiowano",
    cta: "Załóż darmowe konto",
  },
  de: {
    eyebrow: "Live-Demo",
    heading: "Testen Sie das Formular, das spricht",
    subtitle: "Rechts sehen Sie ein echtes Mulbox-Formular im Gesprächsmodus. Beantworten Sie ein paar Fragen und sehen Sie, wie es Informationen für Sie sammelt.",
    leftTitle: "So funktioniert es bei Ihnen",
    leftText: "Statt leerer Felder führt der Kunde ein kurzes Gespräch, und Sie erhalten eine fertige Zusammenfassung per E-Mail (und als PDF). Einbinden mit einem Code:",
    codeLabel: "Fügen Sie diesen Code auf Ihrer Website ein:",
    copy: "Kopieren",
    copied: "Kopiert",
    cta: "Kostenloses Konto erstellen",
  },
  en: {
    eyebrow: "Live demo",
    heading: "Try the form that talks",
    subtitle: "On the right is a real Mulbox form in conversation mode. Answer a few questions and see how it collects information for you.",
    leftTitle: "How it works for you",
    leftText: "Instead of empty fields, the client has a short conversation, and you get a ready summary by email (and PDF). Embed it with one snippet:",
    codeLabel: "Paste this code on your website:",
    copy: "Copy",
    copied: "Copied",
    cta: "Create free account",
  },
  fr: {
    eyebrow: "Démo en direct",
    heading: "Essayez le formulaire qui dialogue",
    subtitle: "À droite, un vrai formulaire Mulbox en mode conversation. Répondez à quelques questions et voyez comment il collecte les informations pour vous.",
    leftTitle: "Comment ça marche chez vous",
    leftText: "Au lieu de champs vides, le client a une courte conversation, et vous recevez un résumé prêt par e-mail (et en PDF). Intégrez-le avec un seul code :",
    codeLabel: "Collez ce code sur votre site :",
    copy: "Copier",
    copied: "Copié",
    cta: "Créer un compte gratuit",
  },
  es: {
    eyebrow: "Demo en vivo",
    heading: "Prueba el formulario que conversa",
    subtitle: "A la derecha tienes un formulario real de Mulbox en modo conversación. Responde unas preguntas y mira cómo recoge la información por ti.",
    leftTitle: "Así funciona para ti",
    leftText: "En lugar de campos vacíos, el cliente mantiene una breve conversación y tú recibes un resumen listo por correo (y en PDF). Insértalo con un solo código:",
    codeLabel: "Pega este código en tu web:",
    copy: "Copiar",
    copied: "Copiado",
    cta: "Crear cuenta gratis",
  },
  it: {
    eyebrow: "Demo dal vivo",
    heading: "Prova il modulo che conversa",
    subtitle: "A destra c'è un vero modulo Mulbox in modalità conversazione. Rispondi a qualche domanda e guarda come raccoglie le informazioni per te.",
    leftTitle: "Come funziona per te",
    leftText: "Invece di campi vuoti, il cliente fa una breve conversazione e tu ricevi un riepilogo pronto via e-mail (e in PDF). Inseriscilo con un solo codice:",
    codeLabel: "Incolla questo codice nel tuo sito:",
    copy: "Copia",
    copied: "Copiato",
    cta: "Crea un account gratuito",
  },
};

export function LiveDemo() {
  const locale = useLocale();
  const router = useRouter();
  const t = T[locale] ?? T.pl;
  const [copied, setCopied] = useState(false);

  const snippet = `<iframe
  src="https://mulbox.ch/p/TWOJ-ID-FORMULARZA"
  width="100%" height="640"
  style="border:0;border-radius:16px"
  title="Mulbox"></iframe>`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  }

  return (
    <section id="demo" className="section bg-slate-50 dark:bg-[#0a0a14]" aria-labelledby="demo-heading">
      <div className="container-fluid max-w-6xl">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-600/10 text-brand-700 dark:text-brand-300 px-3 py-1 text-xs font-semibold">
            <Sparkles size={13} /> {t.eyebrow}
          </span>
          <h2 id="demo-heading" className="h2 mt-4 text-slate-900 dark:text-white">{t.heading}</h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300">{t.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* LEWA: opis + kod do wklejenia */}
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t.leftTitle}</h3>
            <p className="mt-3 text-slate-600 dark:text-slate-300 leading-relaxed">{t.leftText}</p>

            <p className="mt-6 mb-2 text-sm font-medium text-slate-500 dark:text-slate-400">{t.codeLabel}</p>
            <div className="rounded-2xl bg-[#05080f] border border-gray-800 overflow-hidden shadow-xl">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-800 bg-[#080c14]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-xs text-gray-500 ml-2 font-mono">embed.html</span>
                </div>
                <button
                  onClick={copy}
                  className="inline-flex items-center gap-1.5 text-xs text-gray-300 hover:text-white transition"
                >
                  {copied ? <><Check size={13} /> {t.copied}</> : <><Copy size={13} /> {t.copy}</>}
                </button>
              </div>
              <pre className="p-5 overflow-x-auto font-mono text-xs text-purple-300/90 leading-relaxed text-left">{snippet}</pre>
            </div>
          </div>

          {/* PRAWA: żywy czat demo */}
          <div className="lg:sticky lg:top-8">
            <ConversationalForm
              formId="demo"
              demo
              lang={locale}
              demoCtaLabel={t.cta}
              onDemoCta={() => router.push("/register")}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
