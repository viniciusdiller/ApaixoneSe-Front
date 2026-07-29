"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Info,
  Video,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { secretariaTurismoApi } from "@/lib/api/secretaria-turismo";
import type { SecretariaTurismo } from "@/lib/api";
import { safeMediaUrl } from "@/lib/safeMediaUrl";

function Carousel({ urls, alt }: { urls: string[]; alt: string }) {
  const [idx, setIdx] = useState(0);
  const total = urls.length;
  const prev = () => setIdx((i) => (i - 1 + total) % total);
  const next = () => setIdx((i) => (i + 1) % total);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  if (total === 0) return null;

  if (total === 1) {
    const src = safeMediaUrl(urls[0]);
    return src ? (
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-muted">
        <Image src={src} alt={alt} fill className="object-cover" />
      </div>
    ) : null;
  }

  const src = safeMediaUrl(urls[idx]);
  return (
    <div className="select-none space-y-3">
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-muted">
        {src && (
          <Image
            src={src}
            alt={`${alt} ${idx + 1}`}
            fill
            className="object-cover transition-opacity duration-300"
          />
        )}
        <button
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
          aria-label="Anterior"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
          aria-label="Próxima"
        >
          <ChevronRight size={20} />
        </button>
        <span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-0.5 text-xs text-white backdrop-blur-sm">
          {idx + 1} / {total}
        </span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {urls.map((url, i) => {
          const s = safeMediaUrl(url);
          return s ? (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border-2 transition ${
                i === idx
                  ? "border-primary opacity-100"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={s}
                alt={`Thumb ${i + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ) : null;
        })}
      </div>
    </div>
  );
}

function StickyVideo({ url }: { url: string }) {
  const src = safeMediaUrl(url);
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const box = videoBoxRef.current;
    if (!wrap || !box) return;
    const onScroll = () => {
      const wrapRect = wrap.getBoundingClientRect();
      const boxH = box.offsetHeight;
      const top = 96;
      if (wrapRect.top > top) {
        box.style.position = "relative";
        box.style.top = "0";
      } else if (wrapRect.bottom - boxH < top) {
        box.style.position = "absolute";
        box.style.top = `${wrap.offsetHeight - boxH}px`;
      } else {
        box.style.position = "fixed";
        box.style.top = `${top}px`;
        box.style.width = `${wrap.offsetWidth}px`;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!src) return null;
  return (
    <div ref={wrapRef} className="relative hidden lg:block">
      <div ref={videoBoxRef} className="w-full">
        <div className="overflow-hidden rounded-2xl border border-border bg-black shadow-lg">
          <div className="flex items-center gap-2 border-b border-border/40 bg-black/60 px-4 py-2">
            <Video size={14} className="text-white/60" />
            <span className="text-xs text-white/60">Vídeo</span>
          </div>
          <video
            src={src}
            controls
            className="w-full"
            style={{ maxHeight: "360px" }}
          />
        </div>
      </div>
    </div>
  );
}

export default function SecretariaTurismoPage() {
  const [secretaria, setSecretaria] = useState<SecretariaTurismo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 4;

  useEffect(() => {
    secretariaTurismoApi
      .getAll()
      .then((data) => setSecretaria(data[0] ?? null))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  // Ordena pelo campo `ordem` para refletir a ordem definida no admin
  const turistandos = [...(secretaria?.turistandos ?? [])].sort(
    (a, b) => ((a as any).ordem ?? 0) - ((b as any).ordem ?? 0),
  );

  const totalPages = Math.ceil(turistandos.length / ITEMS_PER_PAGE);

  const currentTuristandos = turistandos.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <main className="min-h-screen bg-background">
      <section className="relative overflow-hidden bg-primary px-4 pb-16 pt-32">
        <span
          aria-hidden
          className="absolute right-8 top-1/2 -translate-y-1/2 select-none text-[160px] opacity-10"
        >
          🏖️
        </span>
        <div className="container relative z-10 mx-auto">
          <Link
            href="/servicos"
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2 text-sm text-primary-foreground/80 transition-colors hover:bg-primary-foreground/20 hover:text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para Serviços
          </Link>
          <div className="mb-3 inline-flex items-center gap-2">
            <span className="inline-block rounded-full bg-primary-foreground/20 px-3 py-1 text-xs font-semibold text-primary-foreground">
              Prefeitura de Saquarema
            </span>
          </div>
          <h1 className="font-display text-5xl font-bold uppercase text-primary-foreground drop-shadow-lg md:text-6xl">
            Secretaria de Turismo
          </h1>
          <p className="mt-4 max-w-xl text-lg text-primary-foreground/80">
            Esporte, Lazer e Turismo — Prefeitura de Saquarema.
          </p>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="container mx-auto max-w-6xl">
          {loading && (
            <div className="animate-pulse space-y-6">
              <div className="h-6 w-40 rounded bg-muted" />
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_420px]">
                <div className="space-y-4">
                  <div className="h-4 w-full rounded bg-muted" />
                  <div className="h-4 w-5/6 rounded bg-muted" />
                  <div className="h-4 w-4/6 rounded bg-muted" />
                </div>
                <div className="hidden aspect-video rounded-2xl bg-muted lg:block" />
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
              <AlertCircle className="mb-4 h-10 w-10 text-destructive/60" />
              <p className="text-base font-medium">
                Não foi possível carregar as informações da Secretaria.
              </p>
              <p className="mt-1 text-sm">
                Verifique sua conexão e tente novamente.
              </p>
            </div>
          )}

          {!loading && !error && !secretaria && (
            <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
              <Info className="mb-4 h-10 w-10 text-muted-foreground/50" />
              <p className="text-base font-medium">
                Informações da Secretaria de Turismo não disponíveis no momento.
              </p>
            </div>
          )}

          {!loading && !error && secretaria && (
            <div className="space-y-16">
              {/* Institucional */}
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_420px]">
                <div className="space-y-8">
                  <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Info size={20} />
                      </div>
                      <h2 className="text-xl font-bold text-foreground">
                        Sobre a Secretaria
                      </h2>
                    </div>
                    <p className="whitespace-pre-line text-base leading-relaxed text-muted-foreground">
                      {secretaria.textoExplicativo}
                    </p>
                  </div>
                </div>
                {secretaria.videoUrl && (
                  <StickyVideo url={secretaria.videoUrl} />
                )}
              </div>

              {/* Vídeo mobile */}
              {secretaria.videoUrl && (
                <div className="block lg:hidden">
                  {(() => {
                    const src = safeMediaUrl(secretaria.videoUrl!);
                    return src ? (
                      <div className="overflow-hidden rounded-2xl border border-border bg-black shadow-sm">
                        <div className="flex items-center gap-2 border-b border-border/40 bg-black/60 px-4 py-2">
                          <Video size={14} className="text-white/60" />
                          <span className="text-xs text-white/60">Vídeo</span>
                        </div>
                        <video src={src} controls className="w-full" />
                      </div>
                    ) : null;
                  })()}
                </div>
              )}

              {/* Turistando / Projetos */}
              {turistandos.length > 0 && (
                <div className="space-y-10">
                  <h2 className="border-b border-border pb-3 text-2xl font-bold text-foreground">
                    Projetos
                  </h2>

                  <div className="space-y-12">
                    {currentTuristandos.map((t, i) => (
                      <div
                        key={t.id}
                        className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2"
                      >
                        <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                          <h3 className="mb-3 text-lg font-semibold text-foreground">
                            {t.titulo}
                          </h3>
                          <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                            {t.texto}
                          </p>
                        </div>
                        {t.imagensUrl?.length > 0 && (
                          <div
                            className={`relative aspect-video w-full overflow-hidden rounded-xl shadow-sm ${
                              i % 2 === 1 ? "lg:order-1" : ""
                            }`}
                          >
                            <Carousel urls={t.imagensUrl} alt={t.titulo} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Controles de paginação */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-center gap-4 border-t border-border pt-8">
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                        className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
                      >
                        <ChevronLeft size={16} /> Anterior
                      </button>

                      <span className="text-sm font-medium text-muted-foreground">
                        Página {currentPage} de {totalPages}
                      </span>

                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
                      >
                        Próxima <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
