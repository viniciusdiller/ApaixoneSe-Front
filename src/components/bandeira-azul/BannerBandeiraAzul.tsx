"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { bandeiraAzulApi } from "@/lib/api";
import type { BandeiraAzul } from "@/lib/api";
import { safeMediaUrl } from "@/lib/safeMediaUrl";

const INTERVALO_MS = 5000;

/**
 * Coluna lateral com o carrossel da Bandeira Azul; some se o admin ainda não
 * publicou a página. Clicar na foto abre a página informativa.
 */
export function BannerBandeiraAzul() {
  const [pagina, setPagina] = useState<BandeiraAzul | null>(null);
  const [atual, setAtual] = useState(0);
  const [pausado, setPausado] = useState(false);

  useEffect(() => {
    bandeiraAzulApi
      .get()
      .then(setPagina)
      .catch(() => setPagina(null));
  }, []);

  const fotos = pagina?.bannerImagens ?? [];
  const total = fotos.length;

  useEffect(() => {
    if (total < 2 || pausado) return;
    // Quem prefere menos movimento vê a foto fixa (a troca fica por conta das setas)
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setAtual((i) => (i + 1) % total), INTERVALO_MS);
    return () => clearInterval(timer);
  }, [total, pausado]);

  if (!pagina) return null;

  const anterior = () => setAtual((i) => (i - 1 + total) % total);
  const proxima = () => setAtual((i) => (i + 1) % total);

  return (
    <aside className="order-first w-full pt-10 lg:order-last lg:sticky lg:top-24 lg:w-[26rem] lg:shrink-0 lg:pt-12">
      <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-foreground">
        <Flag className="h-5 w-5 text-primary" />
        Bandeira Azul
      </h2>
      <p className="mb-4 mt-1 text-sm text-muted-foreground">
        {pagina.subtitulo || "clique na foto para saber mais"}
      </p>

      <div
        className="relative h-[420px] overflow-hidden rounded-2xl border-2 border-primary bg-gradient-to-b from-sky-700 to-cyan-500 shadow-md transition-shadow hover:shadow-xl lg:h-[540px]"
        onMouseEnter={() => setPausado(true)}
        onMouseLeave={() => setPausado(false)}
      >
        {fotos.map((url, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={url}
            src={safeMediaUrl(url)}
            alt=""
            aria-hidden={i !== atual}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${i === atual ? "opacity-100" : "opacity-0"}`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        <Link
          href="/praias/bandeira-azul"
          aria-label={`${pagina.titulo} — saiba mais`}
          className="absolute inset-0 z-10 flex items-end justify-center p-6 pb-12"
        >
          <span className="rounded-2xl border-2 border-dashed border-white/80 bg-black/30 px-5 py-3 text-center text-sm font-bold uppercase text-white backdrop-blur-sm">
            {pagina.titulo}
          </span>
        </Link>

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={anterior}
              aria-label="Foto anterior"
              className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/80 p-1.5 text-primary shadow hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={proxima}
              aria-label="Próxima foto"
              className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/80 p-1.5 text-primary shadow hover:bg-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
              {fotos.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setAtual(i)}
                  aria-label={`Ver foto ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${i === atual ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
