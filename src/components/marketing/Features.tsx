import { FileText, Palette, Link2, Mail, BarChart3 } from "lucide-react";

const FEATURES = [
  { icon: FileText, title: "Wiele typów formularzy", text: "Kontaktowe, zgłoszeniowe, ankiety, zapisy, zamówienia i wiele więcej." },
  { icon: Palette, title: "Pełna personalizacja", text: "Dostosuj wygląd formularza do swojej marki. Kolory, czcionki, tła i więcej." },
  { icon: Link2, title: "Udostępnij wszędzie", text: "Masz swój link do formularza lub osadź go na swojej stronie w kilka sekund." },
  { icon: Mail, title: "Zbieraj wiadomości", text: "Wszystkie odpowiedzi trafiają do Twojego panelu i na email. Nic Ci nie umknie." },
  { icon: BarChart3, title: "Zarządzaj leadami", text: "Buduj swoją listę kontaktów, eksportuj dane i rozwijaj swój biznes." },
];

/** Sekcja "Funkcje" – grid 5-kolumnowy na desktopie, 1 kolumna na mobile. */
export function Features() {
  return (
    <section id="funkcje" className="section">
      <div className="container-fluid">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                <Icon size={22} />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
