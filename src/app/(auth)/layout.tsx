import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-brand-50 via-white to-white">
      <header className="container-fluid py-6">
        <Logo />
      </header>
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <footer className="container-fluid py-6 text-center text-xs text-slate-500">
        <Link href="/" className="hover:text-slate-700">← Wróć na stronę główną</Link>
      </footer>
    </div>
  );
}
