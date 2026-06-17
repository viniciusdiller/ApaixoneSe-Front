import type { CatMovel } from "./api/types";

/**
 * Deriva a mídia ativa de um CatMovel e seu tipo.
 * Prioriza imagemUrl; usa videoUrl como fallback.
 */
export function catMovelMidia(item: CatMovel): {
  url: string | null;
  type: "image" | "video" | null;
} {
  if (item.imagemUrl) return { url: item.imagemUrl, type: "image" };
  if (item.videoUrl) return { url: item.videoUrl, type: "video" };
  return { url: null, type: null };
}
