"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";

const NAV = [
  { href: "/#funkcje", label: "Funkcje" },
  { href: "/#przyklady", label: "Przykłady" },
  { href: "/pricing", label: "Cennik" },
  { href: "/#faq", label: "FAQ" },
  { href: "/kontakt", label: "Kontakt" },
];

/** Sticky, w pełni responsywny header strefy publicznej. */
export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/80 backdrop-blur">
      <div className="container-fluid flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          {NAV.map((it) => (
            <Link key={it.href} href={it.href} className="hover:text-slate-900 transition">
              {it.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="btn-ghost">Zaloguj się</Link>
          <Link href="/register" className="btn-primary">Załóż konto</Link>
        </div>
        <button
          className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-slate-700 hover:bg-slate-100"
          onClick={() => setOpen((v) => !v)}
          aria-label="Otwórz menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white">
          <div className="container-fluid flex flex-col gap-1 py-3">
            {NAV.map((it) => (
              <Link key={it.href} href={it.href} className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50" onClick={() => setOpen(false)}>
                {it.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Link href="/login" className="btn-secondary w-full">Zaloguj</Link>
              <Link href="/register" className="btn-primary w-full">Załóż konto</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
