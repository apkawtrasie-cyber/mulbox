import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";

/** Wspólny layout dla całej strefy publicznej (marketing + sekcja prawna). */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
