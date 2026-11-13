import type { BandeiraAzulBloco, BandeiraAzulMidia } from "@/lib/api";
import { safeMediaUrl } from "@/lib/safeMediaUrl";

const HEX = /^#[0-9a-fA-F]{6}$/;

/** Converte links do YouTube em URL de embed; null para qualquer outro endereço. */
export function youtubeEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    let id: string | null = null;
    if (host === "youtu.be") id = u.pathname.slice(1);
    else if (host === "youtube.com" || host === "m.youtube.com") {
      id = u.searchParams.get("v") ?? u.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1] ?? null;
    }
    return id && /^[\w-]{6,20}$/.test(id)
      ? `https://www.youtube-nocookie.com/embed/${id}`
      : null;
  } catch {
    return null;
  }
}

function Imagem({ item }: { item: BandeiraAzulMidia }) {
  // eslint-disable-next-line @next/next/no-img-element
  const img = <img src={safeMediaUrl(item.url)} alt="" className="w-full rounded-xl object-cover" loading="lazy" />;
  return item.link ? (
    <a href={item.link} target="_blank" rel="noopener noreferrer">
      {img}
    </a>
  ) : (
    img
  );
}

function Video({ item }: { item: BandeiraAzulMidia }) {
  const embed = youtubeEmbed(item.url);
  if (embed) {
    return (
      <iframe
        src={embed}
        title="Vídeo"
        className="aspect-video w-full rounded-xl"
        allow="accelerometer; encrypted-media; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    );
  }
  return (
    <video
      src={safeMediaUrl(item.url)}
      controls
      preload="metadata"
      className="aspect-video w-full rounded-xl bg-black"
    />
  );
}

/** Renderiza os blocos da página. Texto vai como texto puro (sem HTML). */
export function BlocosBandeiraAzul({ blocos }: { blocos: BandeiraAzulBloco[] }) {
  return (
    <div className="space-y-6">
      {blocos.map((bloco, i) => {
        const bg = bloco.bgColor && HEX.test(bloco.bgColor) ? bloco.bgColor : undefined;

        if (bloco.type === "text") {
          if (!bloco.content.trim()) return null;
          return (
            <div
              key={i}
              className={`whitespace-pre-line rounded-2xl p-6 text-lg leading-relaxed ${bloco.isBold ? "font-bold" : ""} ${bg ? "text-gray-800" : "text-foreground"}`}
              style={bg ? { backgroundColor: bg } : undefined}
            >
              {bloco.content}
            </div>
          );
        }

        const itens = (bloco.type === "image" ? bloco.images : bloco.videos) ?? [];
        if (itens.length === 0) return null;
        return (
          <div key={i} className={`grid gap-4 ${itens.length > 1 ? "md:grid-cols-2" : ""}`}>
            {itens.map((item, j) =>
              bloco.type === "image" ? (
                <Imagem key={j} item={item} />
              ) : (
                <Video key={j} item={item} />
              ),
            )}
          </div>
        );
      })}
    </div>
  );
}
