import { Code2, QrCode, Link as LinkIcon } from "lucide-react";

const SNIPPET = `<form action="https://mulbox.ch/api/f/abc123" method="POST">
  <input name="name" placeholder="Imię i nazwisko" />
  <input name="email" type="email" placeholder="Email" />
  <button type="submit">Wyślij wiadomość</button>
</form>`;

/**
 * Sekcja "Elastyczne udostępnianie" – układ szachownicowy 3 kontenerów:
 * 1) Snippet HTML (szeroki, lewo)
 * 2) Kod QR (wąski, prawo)
 * 3) Link / Landing (szeroki, lewo)
 */
export function CodeShowcase() {
  return (
    <section id="przyklady" className="py-24 sm:py-32 bg-[#090d16] text-white" aria-labelledby="share-heading">
      <div className="container-fluid max-w-6xl">
        {/* Nagłówek */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-24">
          <h2 id="share-heading" className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Elastyczne udostępnianie. <br />
            <span className="text-purple-400">Ty wybierasz, jak zbierasz leady.</span>
          </h2>
          <p className="text-lg text-gray-400 leading-relaxed">
            Niezależnie od tego, czy masz zaawansowaną stronę, prostego bloga, czy biznes lokalny – Mulbox dopasuje się do Twojego stylu.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* === KONTENER 1: HTML SNIPPET === */}
          <article className="lg:col-span-7 rounded-3xl bg-[#0d1321] border border-gray-800 p-8 md:p-10 flex flex-col justify-between hover:border-purple-500/30 transition-all duration-300">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-8">
                <Code2 size={26} />
              </div>

              <div className="rounded-2xl bg-[#05080f] border border-gray-900 overflow-hidden mb-8 shadow-2xl">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-900 bg-[#080c14]">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-xs text-gray-500 ml-2 font-mono">form.html</span>
                </div>
                <pre className="p-6 overflow-x-auto font-mono text-xs text-purple-300/90 leading-relaxed text-left">
                  {SNIPPET}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-3">Jeden czysty snippet HTML</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Masz stronę na WordPressie, Elementorze, Webflow czy Next.js? Wklejasz ten krótki kod bezpośrednio w strukturę swojej witryny. Formularz natychmiast działa bez instalowania ciężkich, dziurawych wtyczek, które zapychają bazę i blokują wysyłkę maili.
              </p>
            </div>
          </article>

          {/* === KONTENER 2: KOD QR === */}
          <article className="lg:col-span-5 rounded-3xl bg-[#0d1321] border border-gray-800 p-8 md:p-10 flex flex-col justify-between hover:border-purple-500/30 transition-all duration-300">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-8">
                <QrCode size={26} />
              </div>

              <div className="flex justify-center items-center py-8 mb-8 rounded-2xl bg-[#05080f] border border-gray-900 shadow-2xl">
                <div className="relative p-4 bg-[#0d1321] rounded-2xl border border-gray-800 shadow-inner flex items-center justify-center w-40 h-40">
                  <div className="w-full h-full border-4 border-dashed border-purple-500/40 rounded-xl flex items-center justify-center">
                    <div className="w-28 h-28 border-4 border-purple-500 rounded-lg flex items-center justify-center bg-[#05080f]">
                      <div className="w-12 h-12 bg-purple-600 rounded-md flex items-center justify-center font-bold text-xs shadow-md">
                        M
                      </div>
                    </div>
                  </div>
                  <span aria-hidden className="absolute top-6 left-6 w-4 h-4 border-2 border-purple-400 bg-[#05080f]" />
                  <span aria-hidden className="absolute top-6 right-6 w-4 h-4 border-2 border-purple-400 bg-[#05080f]" />
                  <span aria-hidden className="absolute bottom-6 left-6 w-4 h-4 border-2 border-purple-400 bg-[#05080f]" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-3">Kod QR dla biznesu lokalnego</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Idealne rozwiązanie do fizycznego świata. Pobierz automatycznie wygenerowany, unikalny kod QR i umieść go na ulotkach, stoliku w restauracji, banerze reklamowym lub na firmowym aucie. Klienci skanują go smartfonem i od razu przechodzą do formularza kontaktowego.
              </p>
            </div>
          </article>

          {/* === KONTENER 3: LINK / LANDING === */}
          <article className="lg:col-span-12 rounded-3xl bg-[#0d1321] border border-gray-800 p-8 md:p-10 flex flex-col justify-between hover:border-purple-500/30 transition-all duration-300">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-8">
                <LinkIcon size={26} />
              </div>

              <div className="rounded-2xl bg-[#05080f] border border-gray-900 p-4 mb-8 shadow-2xl flex items-center gap-3 font-mono text-sm text-gray-400 overflow-x-auto">
                <span className="text-green-500 text-xs">●</span>
                <span className="text-gray-600 select-none">https://</span>
                <span className="text-purple-300 whitespace-nowrap">mulbox.ch/f/twoja-firma</span>
                <span className="ml-auto bg-purple-600/20 text-purple-400 text-xs px-3 py-1 rounded-lg border border-purple-500/20 select-none whitespace-nowrap">Copy</span>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-3">Bezpośredni link (Landing Page)</h3>
              <p className="text-gray-400 text-sm leading-relaxed max-w-3xl">
                Nie potrzebujesz własnej strony www ani hostingu, żeby profesjonalnie zbierać zlecenia. Mulbox tworzy dla każdego formularza gotową, czystą stronę docelową. Skopiuj wygenerowany link i umieść go w bio na Instagramie, TikToku, profilu LinkedIn lub wyślij bezpośrednio klientowi w wiadomości.
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
