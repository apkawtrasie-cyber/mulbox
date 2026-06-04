import type { Metadata } from "next";
import { ContactForm } from "../ContactForm";

export const metadata: Metadata = {
  title: "Formularz kontaktowy",
  description: "Wyślij nam wiadomość – odpowiadamy w ciągu 24h.",
};

export default function ContactFormPage() {
  return (
    <section className="section">
      <div className="container-fluid">
        <ContactForm />
      </div>
    </section>
  );
}
