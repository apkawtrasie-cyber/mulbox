import type { Metadata } from "next";
import { ContactForm } from "./ContactForm";
import { Mail, MapPin, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Kontakt",
  description: "Skontaktuj się z zespołem Mulbox.ch. Odpowiadamy zwykle w 24h.",
};

export default function ContactPage() {
  return (
    <section className="section">
      <div className="container-fluid max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h1 className="h1 text-slate-900">Porozmawiajmy.</h1>
          <p className="mt-4 text-lg text-slate-600">
            Masz pytania o plany, integrację z WordPressem lub potrzebujesz indywidualnej oferty?
            Wyślij wiadomość – odpowiadamy w 24 godziny.
          </p>
          <ul className="mt-8 space-y-4 text-slate-700">
            <li className="flex items-center gap-3"><Mail className="text-brand-600" size={20} /> kontakt@mulbox.ch</li>
            <li className="flex items-center gap-3"><MapPin className="text-brand-600" size={20} /> Zürich, Szwajcaria</li>
            <li className="flex items-center gap-3"><Clock className="text-brand-600" size={20} /> Pn–Pt, 9:00–17:00 CET</li>
          </ul>
        </div>
        <div className="card">
          <ContactForm />
        </div>
      </div>

      {/* TEST EMBED – do usunięcia po weryfikacji */}
      {process.env.NEXT_PUBLIC_CONTACT_FORM_ID && (
        <div className="container-fluid max-w-2xl mt-16">
          <h2 className="text-xl font-semibold text-slate-900 mb-6 text-center">Brief / Zapytanie ofertowe</h2>
          <div className="rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <iframe
              src={`${process.env.NEXT_PUBLIC_APP_URL}/p/${process.env.NEXT_PUBLIC_CONTACT_FORM_ID}`}
              width="100%"
              height="1600"
              style={{ border: 0, display: "block" }}
              loading="lazy"
              title="Formularz Brief Mulbox"
            />
          </div>
        </div>
      )}
    </section>
  );
}
