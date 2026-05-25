/**
 * Garante que uma URL de mídia vinda do backend seja válida para o browser.
 *
 * O backend pode salvar caminhos com espaços literais (ex: "/uploads/Servico Turista/logo.webp").
 * O browser não codifica espaços automaticamente em atributos src/href,
 * então a imagem/arquivo quebra. Esta função:
 *   1. Decodifica a URL completamente (evita dupla codificação caso já tenha %20)
 *   2. Re-codifica cada segmento do path preservando as barras
 *   3. Mantém URLs absolutas (http/https) e relativas intactas
 */
export function safeMediaUrl(url: string | null | undefined): string {
  if (!url) return "";

  try {
    // URL absoluta (http:// ou https://)
    if (/^https?:\/\//i.test(url)) {
      const parsed = new URL(url);
      // Re-codifica apenas o pathname segmento a segmento
      parsed.pathname = parsed.pathname
        .split("/")
        .map((seg) => encodeURIComponent(decodeURIComponent(seg)))
        .join("/");
      return parsed.toString();
    }

    // URL relativa (ex: /uploads/Servico Turista/logo.webp)
    // Separa o path de uma possível query string/hash
    const [pathPart, ...rest] = url.split("?");
    const query = rest.length ? "?" + rest.join("?") : "";

    const encodedPath = pathPart
      .split("/")
      .map((seg) => encodeURIComponent(decodeURIComponent(seg)))
      .join("/");

    return encodedPath + query;
  } catch {
    // Se falhar por qualquer motivo, retorna a URL original sem quebrar
    return url;
  }
}
