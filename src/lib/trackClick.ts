/**
 * Dispara um clique anônimo para o contador de analytics (POST /api/clicks,
 * proxyado pelo rewrite em next.config.mjs). Fire-and-forget: nunca lança,
 * nunca bloqueia navegação.
 */
export function trackClick(categoria: string, pagina: string) {
  if (typeof navigator === "undefined") return;

  const body = JSON.stringify({ categoria, pagina });

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/clicks",
        new Blob([body], { type: "application/json" }),
      );
    } else {
      fetch("/api/clicks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // fire-and-forget: nunca bloqueia navegação
  }
}
