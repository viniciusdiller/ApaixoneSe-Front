"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Flag } from "lucide-react";
import { bandeiraAzulApi } from "@/lib/api";
import type { BandeiraAzul } from "@/lib/api";
import { safeMediaUrl } from "@/lib/safeMediaUrl";

const INTERVALO_MS = 5000;

/** Banner da Bandeira Azul com fotos em rotação; some se o admin ainda não publicou a página. */
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

  useEffect(() => {
    if (fotos.length < 2 || pausado) return;
    // Quem prefere menos movimento vê a primeira foto fixa
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setAtual((i) => (i + 1) % fotos.length), INTERVALO_MS);
    return () => clearInterval(timer);
  }, [fotos.length, pausado]);

  if (!pagina) return null;

  return (
    <section className="px-4 pb-8 pt-10">
      <div
        className="group relative mx-auto min-h-[180px] max-w-6xl overflow-hidden rounded-2xl bg-gradient-to-r from-sky-700 to-cyan-500 shadow-md transition-shadow hover:shadow-xl md:min-h-[260px]"
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
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/10" />

        <Link
          href="/praias/bandeira-azul"
          aria-label={`${pagina.titulo} — saiba mais`}
          className="relative z-10 flex min-h-[inherit] items-center justify-between gap-4 p-6 md:p-10"
        >
          <div>
            <span className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              <Flag className="h-3.5 w-3.5" />
              Bandeira Azul
            </span>
            <h2 className="font-display text-3xl font-bold uppercase text-white md:text-4xl">
              {pagina.titulo}
            </h2>
            {pagina.subtitulo && (
              <p className="mt-2 max-w-xl text-white/85">{pagina.subtitulo}</p>
            )}
          </div>
          <span className="hidden shrink-0 items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-sky-700 transition-transform group-hover:translate-x-1 sm:inline-flex">
            Saiba mais
            <ArrowRight className="h-4 w-4" />
          </span>
        </Link>

        {fotos.length > 1 && (
          <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-2">
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
        )}
      </div>
    </section>
  );
}
