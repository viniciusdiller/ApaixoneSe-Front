import { API_BASE_URL } from "./api/config";

/**
 * Dispara um clique anônimo para o contador de analytics. Fire-and-forget:
 * nunca lança, nunca bloqueia navegação.
 *
 * Usa API_BASE_URL (mesma base de todo o resto do app, via NEXT_PUBLIC_API_URL)
 * em vez da rota relativa /api/clicks proxyada por next.config.mjs: o rewrite
 * aponta pra um backend diferente (172.16.32.199, sem essa rota) do backend
 * que o resto do app realmente usa - confirmado em teste real (404). Ver
 * ApaixoneSe-Back/CLAUDE.md.
 */
export function trackClick(categoria: string, pagina: string) {
  if (typeof navigator === "undefined") return;

  const url = `${API_BASE_URL}/clicks`;
  const body = JSON.stringify({ categoria, pagina });

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
    } else {
      fetch(url, {
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
