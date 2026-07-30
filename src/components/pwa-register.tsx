"use client";

import { useEffect } from "react";

/** Registers the service worker once on mount. Renders nothing. */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Installability/offline shell is a progressive enhancement — a failed
      // registration (e.g. unsupported browser) shouldn't affect the app.
    });
  }, []);

  return null;
}
