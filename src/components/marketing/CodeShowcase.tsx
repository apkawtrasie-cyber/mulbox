/**
 * Ciemna sekcja prezentująca czysty HTML formularza Mulbox – pokazuje,
 * że integracja z WordPressem (np. blok "Własny HTML") jest banalnie prosta.
 */
const SAMPLE_HTML = `<form action="https://mulbox.ch/api/f/abc123" method="POST"
  class="w-full max-w-md mx-auto space-y-3 rounded-2xl bg-white p-6 shadow">
  <input name="name"  placeholder="Imię i nazwisko"
         class="w-full rounded-xl border border-slate-200 px-4 py-3" />
  <input name="email" type="email" placeholder="Email"
         class="w-full rounded-xl border border-slate-200 px-4 py-3" />
  <textarea name="message" placeholder="Wiadomość…"
         class="w-full rounded-xl border border-slate-200 px-4 py-3 h-28"></textarea>
  <button class="w-full rounded-xl bg-violet-600 py-3 font-semibold text-white">
    Wyślij wiadomość
  </button>
</form>`;

export function CodeShowcase() {
  return (
    <section id="przyklady" className="bg-slate-950 text-slate-100 py-20">
      <div className="container-fluid grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="h2">
            Wystarczy <span className="gradient-text">jeden snippet HTML.</span>
          </h2>
          <p className="mt-4 text-slate-300 max-w-xl">
            Wklej go w blok "Własny HTML" w WordPressie, Elementorze, Webflow czy zwykłym HTML – i Twój formularz natychmiast działa. Bez wtyczek, które blokują hosting i nie odsyłają maili.
          </p>
          <ul className="mt-6 space-y-2 text-slate-300">
            <li>• Zero ryzyka, że wtyczka znowu zablokuje serwer.</li>
            <li>• Maile docierają z naszej zweryfikowanej domeny – koniec ze spamem.</li>
            <li>• Pełna kontrola: redirect, autoresponder, reCAPTCHA, eksport CSV.</li>
          </ul>
        </div>
        <div className="rounded-2xl bg-slate-900 ring-1 ring-white/10 shadow-2xl overflow-hidden">
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/10">
            <span className="h-3 w-3 rounded-full bg-rose-400" />
            <span className="h-3 w-3 rounded-full bg-amber-300" />
            <span className="h-3 w-3 rounded-full bg-emerald-400" />
            <span className="ml-3 text-xs text-slate-400">form.html</span>
          </div>
          <pre className="overflow-x-auto p-5 text-xs sm:text-sm leading-relaxed">
            <code className="text-slate-200">{SAMPLE_HTML}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}
