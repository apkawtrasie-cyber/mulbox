import { Hero } from "@/components/marketing/Hero";
import { Trust } from "@/components/marketing/Trust";
import { Features } from "@/components/marketing/Features";
import { CodeShowcase } from "@/components/marketing/CodeShowcase";

const FAQ = [
  {
    q: "Jak zrobić formularz kontaktowy na WordPressie bez wtyczki Contact Form 7?",
    a: "Mulbox generuje czysty kod HTML formularza, który wklejasz w blok 'Własny HTML' w WordPressie lub Elementorze. Nie instalujesz żadnej wtyczki – formularz działa natychmiast, bez obciążania bazy danych ani PHP.",
  },
  {
    q: "Czym Mulbox różni się od Google Forms i Typeform?",
    a: "Mulbox daje pełną kontrolę nad wyglądem (własne kolory, czcionki, branding), generuje kod HTML do osadzenia bezpośrednio na Twojej stronie, tworzy kody QR oraz oddzielne strony docelowe (landing pages). Nie reklamuje swojej marki na Twoim formularzu i nie wymaga konta Google od klientów.",
  },
  {
    q: "Czy maile z formularza na pewno docierają do mojej skrzynki?",
    a: "Tak. Mulbox wysyła powiadomienia przez Resend ze zweryfikowaną domeną mulbox.ch (poprawne rekordy SPF, DKIM, DMARC). Twój adres trafia do nagłówka Reply-To, więc odpowiadasz klientowi jednym kliknięciem bezpośrednio z własnej skrzynki.",
  },
  {
    q: "Ile kosztuje Mulbox i czy jest plan darmowy?",
    a: "Mulbox ma darmowy plan na start (bez karty kredytowej), plan Personal za 1 PLN/miesiąc oraz Business za 9,90 PLN/miesiąc. Plan Business odblokowuje autoresponder, własne reCAPTCHA, eksport CSV oraz custom redirect po wysłaniu.",
  },
  {
    q: "Jak wygenerować kod QR do formularza dla biznesu lokalnego?",
    a: "Po utworzeniu formularza w panelu Mulbox automatycznie otrzymujesz kod QR, który możesz pobrać i umieścić na ulotkach, stoliku w restauracji, banerze lub w samochodzie. Klient skanuje kod telefonem i od razu trafia na formularz.",
  },
  {
    q: "Czy mogę zbudować formularz bez umiejętności programowania?",
    a: "Tak. Mulbox ma wizualny kreator drag-and-drop. Układasz klocki (Imię, Email, Telefon, Wiadomość, pliki, checkboxy), zmieniasz kolory i wygląd, a wygenerowany kod HTML kopiujesz jednym kliknięciem.",
  },
  {
    q: "Czy Mulbox jest zgodny z RODO/GDPR?",
    a: "Tak. Dane przechowujemy w Unii Europejskiej (Supabase EU), formularze obsługują reCAPTCHA v3, a użytkownik ma pełną kontrolę nad wyświetlaniem zgód i polityki prywatności. Podpisujemy umowę powierzenia danych.",
  },
];

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((it) => ({
    "@type": "Question",
    name: it.q,
    acceptedAnswer: { "@type": "Answer", text: it.a },
  })),
};

/** Strona główna – Mobile First, hero w priorytecie. */
export default function HomePage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />
      <Hero />
      <Trust />
      <Features />
      <CodeShowcase />
      <FaqSection />
      <CtaSection />
    </main>
  );
}

function FaqSection() {
  return (
    <section id="faq" className="section bg-slate-50 dark:bg-[#0a0a14] relative overflow-hidden" aria-labelledby="faq-heading">
      <div aria-hidden className="pointer-events-none absolute bottom-0 right-0 w-[700px] h-[450px]" style={{ background: "radial-gradient(ellipse at 90% 100%, rgba(139,92,246,0.22) 0%, rgba(180,130,255,0.12) 35%, transparent 65%)" }} />
      <div aria-hidden className="pointer-events-none absolute bottom-0 right-0 w-[400px] h-[300px] hidden dark:block" style={{ background: "radial-gradient(ellipse at 95% 100%, rgba(109,40,217,0.45) 0%, rgba(139,92,246,0.2) 40%, transparent 70%)" }} />
      <div className="container-fluid max-w-4xl relative">
        <h2 id="faq-heading" className="h2 text-center text-slate-900 dark:text-white">Najczęstsze pytania</h2>
        <div className="mt-10 space-y-3">
          {FAQ.map((it) => (
            <details key={it.q} className="group rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] p-5">
              <summary className="cursor-pointer list-none font-semibold text-slate-900 dark:text-white flex items-center justify-between gap-4">
                <h3 className="text-base">{it.q}</h3>
                <span className="text-brand-600 dark:text-brand-400 transition group-open:rotate-45 text-2xl leading-none flex-shrink-0">+</span>
              </summary>
              <p className="mt-3 text-slate-600 dark:text-slate-300 leading-relaxed">{it.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="section">
      <div className="container-fluid">
        <div className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-10 sm:p-16 text-white text-center shadow-xl">
          <h2 className="h2">Gotowy na lepsze formularze?</h2>
          <p className="mt-3 text-brand-50/90 max-w-2xl mx-auto">
            Załóż darmowe konto w 2 minuty i zacznij zbierać wiadomości jeszcze dziś.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="/register" className="inline-flex items-center justify-center rounded-xl bg-white text-brand-700 font-semibold px-6 py-3 hover:bg-brand-50 transition">
              Załóż darmowe konto
            </a>
            <a href="/pricing" className="inline-flex items-center justify-center rounded-xl ring-1 ring-white/40 px-6 py-3 hover:bg-white/10 transition">
              Zobacz cennik
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
