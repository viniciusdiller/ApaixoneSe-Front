/**
 * Garante que uma URL de mídia vinda do backend seja válida para o browser.
 *
 * O backend salva caminhos relativos (ex: "/uploads/servico_turista/foto.webp").
 * O browser interpretaria isso como relativo ao frontend (localhost:3000),
 * mas o arquivo está no backend (localhost:6969).
 *
 * Esta função:
 *   1. Prefixo com API_BASE_URL quando a URL é relativa (começa com /uploads)
 *   2. Re-codifica cada segmento do path preservando as barras
 *   3. Mantém URLs absolutas (http/https) intactas
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:6969";

export function safeMediaUrl(url: string | null | undefined): string {
  if (!url) return "";

  try {
    // URL absoluta — apenas re-codifica o pathname
    if (/^https?:\/\//i.test(url)) {
      const parsed = new URL(url);
      parsed.pathname = parsed.pathname
        .split("/")
        .map((seg) => encodeURIComponent(decodeURIComponent(seg)))
        .join("/");
      return parsed.toString();
    }

    // URL relativa — prefixar com o base do backend
    const [pathPart, ...rest] = url.split("?");
    const query = rest.length ? "?" + rest.join("?") : "";

    const encodedPath = pathPart
      .split("/")
      .map((seg) => encodeURIComponent(decodeURIComponent(seg)))
      .join("/");

    return `${API_BASE_URL}${encodedPath}${query}`;
  } catch {
    return url;
  }
}
