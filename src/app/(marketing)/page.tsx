import { Hero } from "@/components/marketing/Hero";
import { Trust } from "@/components/marketing/Trust";
import { Features } from "@/components/marketing/Features";
import { CodeShowcase } from "@/components/marketing/CodeShowcase";

/** Strona główna – Mobile First, hero w priorytecie. */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Trust />
      <Features />
      <CodeShowcase />
      <FaqSection />
      <CtaSection />
    </>
  );
}

function FaqSection() {
  const FAQ = [
    {
      q: "Czy Mulbox działa z WordPressem?",
      a: "Tak. Wystarczy wkleić nasz snippet HTML w blok 'Własny HTML' lub w Elementor. Bez wtyczek, które blokują hosting.",
    },
    {
      q: "Czy maile na pewno docierają do mnie?",
      a: "Wysyłamy je przez naszą zweryfikowaną domenę (Resend, SPF/DKIM/DMARC). Twój adres trafia do nagłówka reply-to – odpowiadasz wprost klientowi.",
    },
    {
      q: "Jak mogę przejść z planu Free na Premium?",
      a: "Z poziomu panelu klienta w zakładce ustawień. Plan Premium odblokowuje autoresponder, custom redirect, eksport CSV i własne reCAPTCHA.",
    },
    {
      q: "Czy mogę zbudować formularz bez kodu?",
      a: "Tak – wizualny kreator pozwala układać klocki (Imię, Email, Telefon, Wiadomość). Wygenerowany kod kopiujesz jednym kliknięciem.",
    },
  ];
  return (
    <section id="faq" className="section bg-slate-50">
      <div className="container-fluid max-w-4xl">
        <h2 className="h2 text-center text-slate-900">Najczęstsze pytania</h2>
        <div className="mt-10 space-y-3">
          {FAQ.map((it) => (
            <details key={it.q} className="group rounded-2xl border border-slate-200 bg-white p-5">
              <summary className="cursor-pointer list-none font-semibold text-slate-900 flex items-center justify-between">
                {it.q}
                <span className="text-brand-600 transition group-open:rotate-45 text-2xl leading-none">+</span>
              </summary>
              <p className="mt-3 text-slate-600">{it.a}</p>
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
