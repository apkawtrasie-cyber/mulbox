import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Informacje prawne wymagane przez prawo szwajcarskie.",
};

export default function ImpressumPage() {
  return (
    <section className="section">
      <div className="container-fluid max-w-3xl prose prose-slate">
        <h1 className="h1 text-slate-900">Impressum</h1>

        <h2 className="h3 mt-10">Dane operatora</h2>
        <p className="text-slate-700 mt-2">
          Mulbox.ch<br />
          ul. Bahnhofstrasse 1<br />
          8001 Zürich, Szwajcaria
        </p>

        <h2 className="h3 mt-8">Kontakt</h2>
        <p className="text-slate-700 mt-2">
          E-mail: <a className="text-brand-700 underline" href="mailto:kontakt@mulbox.ch">kontakt@mulbox.ch</a>
        </p>

        <h2 className="h3 mt-8">Odpowiedzialność za treść</h2>
        <p className="text-slate-700 mt-2">
          Treści naszych stron zostały opracowane z największą starannością. Nie ponosimy jednak odpowiedzialności
          za poprawność, kompletność i aktualność tych treści. Jako usługodawca odpowiadamy zgodnie z przepisami prawa
          szwajcarskiego za własne treści na tych stronach.
        </p>

        <h2 className="h3 mt-8">Odpowiedzialność za linki</h2>
        <p className="text-slate-700 mt-2">
          Nasza oferta zawiera linki do zewnętrznych stron internetowych osób trzecich, na których treść nie mamy
          wpływu. Dlatego nie możemy przejąć odpowiedzialności za te zewnętrzne treści.
        </p>

        <h2 className="h3 mt-8">Prawa autorskie</h2>
        <p className="text-slate-700 mt-2">
          Treści i utwory utworzone przez operatora strony podlegają szwajcarskiemu prawu autorskiemu.
          Powielanie, edytowanie, rozpowszechnianie i wszelkiego rodzaju wykorzystywanie poza granicami prawa
          autorskiego wymagają pisemnej zgody odpowiedniego autora lub twórcy.
        </p>
      </div>
    </section>
  );
}
