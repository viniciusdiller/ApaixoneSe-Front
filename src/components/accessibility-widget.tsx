"use client";

import { useEffect } from "react";

// Carrega o widget Sienna apenas no cliente (o pacote acessa window/document).
export function AccessibilityWidget() {
  useEffect(() => {
    import("sienna-accessibility").catch((err) => {
      console.error("Falha ao carregar o widget de acessibilidade", err);
    });
  }, []);

  return null;
}
