"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("mulbox-theme", next ? "dark" : "light"); } catch { /* */ }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="btn-ghost p-2 rounded-xl"
      title={dark ? "Tryb jasny" : "Tryb ciemny"}
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
