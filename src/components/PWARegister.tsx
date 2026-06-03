"use client";

import { useEffect } from "react";

/** Rejestruje service worker w przeglądarce – wyłącznie w trybie produkcyjnym. */
export function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;
    navigator.serviceWorker.register("/sw.js").catch(() => null);
  }, []);
  return null;
}
