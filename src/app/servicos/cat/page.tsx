"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  AlertCircle,
  Info,
  Images,
  Video,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { catApi } from "@/lib/api";
import type { Cat } from "@/lib/api";
import { safeMediaUrl } from "@/lib/safeMediaUrl";

// ─── Lightbox ─────────────────────────────────────────────────────────────
function Lightbox({
  urls,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  urls: string[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const src = safeMediaUrl(urls[index]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onPrev, onNext]);

  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      <button
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
        onClick={onClose}
      >
        <X size={20} />
      </button>

      {urls.length > 1 && (
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
        >
          <ChevronLeft size={24} />
        </button>
      )}

      <div
        className="relative max-h-[90vh] max-w-[90vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={src}
          alt={`Imagem ${index + 1}`}
          width={1200}
          height={800}
          className="max-h-[90vh] w-auto object-contain"
        />
        <p className="mt-2 text-center text-sm text-white/60">
          {index + 1} / {urls.length}
        </p>
      </div>

      {urls.length > 1 && (
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
        >
          <ChevronRight size={24} />
        </button>
      )}
    </div>
  );
}

// ─── Página pública do CAT ─────────────────────────────────────────────────
export default function CatPage() {
  const [cat, setCat] = useState<Cat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    catApi
      .getAll()
      .then((data) => setCat(data[0] ?? null))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const imagens = cat?.imagensUrl ?? [];
  const total = imagens.length;

  const openLightbox = (i: number) => setLightbox(i);
  const closeLightbox = () => setLightbox(null);
  const prevImg = () =>
    setLightbox((i) => (i !== null ? (i - 1 + total) % total : null));
  const nextImg = () =>
    setLightbox((i) => (i !== null ? (i + 1) % total : null));

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary px-4 pb-16 pt-32">
        <span
          aria-hidden
          className="absolute right-8 top-1/2 -translate-y-1/2 select-none text-[160px] opacity-10"
        >
          ℹ️
        </span>
        <div className="container relative z-10 mx-auto">
          <Link
            href="/servicos"
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2 text-sm text-primary-foreground/80 transition-colors hover:bg-primary-foreground/20 hover:text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Serviços
          </Link>
          <div className="mb-3 inline-flex items-center gap-2">
            <span className="inline-block rounded-full bg-primary-foreground/20 px-3 py-1 text-xs font-semibold text-primary-foreground">
              Ponto de Informação
            </span>
          </div>
          <h1 className="font-display text-5xl font-bold uppercase text-primary-foreground drop-shadow-lg md:text-6xl">
            CAT
          </h1>
          <p className="mt-4 max-w-xl text-lg text-primary-foreground/80">
            Centro de Atendimento ao Turista de Saquarema.
          </p>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox !== null && (
        <Lightbox
          urls={imagens}
          index={lightbox}
          onClose={closeLightbox}
          onPrev={prevImg}
          onNext={nextImg}
        />
      )}

      {/* Conteúdo */}
      <section className="px-4 py-16">
        <div className="container mx-auto max-w-3xl">
          {/* Skeleton */}
          {loading && (
            <div className="animate-pulse space-y-6">
              <div className="rounded-2xl border border-border bg-card p-8 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div className="h-6 w-40 rounded bg-muted" />
                </div>
                <div className="h-4 w-full rounded bg-muted" />
                <div className="h-4 w-5/6 rounded bg-muted" />
                <div className="h-4 w-4/6 rounded bg-muted" />
              </div>
              <div className="h-80 w-full rounded-2xl bg-muted" />
            </div>
          )}

          {/* Erro */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
              <AlertCircle className="mb-4 h-10 w-10 text-destructive/60" />
              <p className="text-base font-medium">
                Não foi possível carregar as informações do CAT.
              </p>
              <p className="mt-1 text-sm">
                Verifique sua conexão e tente novamente.
              </p>
            </div>
          )}

          {/* Sem dados */}
          {!loading && !error && !cat && (
            <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
              <Info className="mb-4 h-10 w-10 text-muted-foreground/50" />
              <p className="text-base font-medium">
                Informações do CAT não disponíveis no momento.
              </p>
            </div>
          )}

          {/* Conteúdo real */}
          {!loading && !error && cat && (
            <div className="space-y-8">
              {/* Texto */}
              <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Info size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">
                    Sobre o CAT
                  </h2>
                </div>
                <p className="whitespace-pre-line text-base leading-relaxed text-muted-foreground">
                  {cat.texto}
                </p>
              </div>

              {/* ── Galeria de Imagens ── */}
              {imagens.length > 0 && (
                <div className="space-y-3">
                  <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
                    <Images size={18} className="text-primary" />
                    Fotos
                    <span className="text-sm font-normal text-muted-foreground">
                      ({imagens.length})
                    </span>
                  </h3>

                  {imagens.length === 1 ? (
                    <button
                      className="w-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
                      onClick={() => openLightbox(0)}
                    >
                      {(() => {
                        const src = safeMediaUrl(imagens[0]);
                        return src ? (
                          <div className="relative h-72 w-full sm:h-96">
                            <Image
                              src={src}
                              alt="Foto do CAT"
                              fill
                              className="object-cover transition-transform duration-300 hover:scale-105"
                            />
                          </div>
                        ) : null;
                      })()}
                    </button>
                  ) : (
                    <div
                      className={`grid gap-2 ${
                        imagens.length === 2
                          ? "grid-cols-2"
                          : imagens.length === 3
                          ? "grid-cols-3"
                          : "grid-cols-2 sm:grid-cols-3"
                      }`}
                    >
                      {imagens.slice(0, 6).map((url, i) => {
                        const src = safeMediaUrl(url);
                        return src ? (
                          <button
                            key={i}
                            onClick={() => openLightbox(i)}
                            className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted"
                          >
                            <Image
                              src={src}
                              alt={`Foto ${i + 1}`}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            {i === 5 && imagens.length > 6 && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-2xl font-bold text-white">
                                +{imagens.length - 6}
                              </div>
                            )}
                          </button>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── Vídeo ── */}
              {cat.videoUrl &&
                (() => {
                  const src = safeMediaUrl(cat.videoUrl);
                  return src ? (
                    <div className="space-y-3">
                      <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
                        <Video size={18} className="text-primary" />
                        Vídeo
                      </h3>
                      <div className="overflow-hidden rounded-2xl border border-border bg-black shadow-sm">
                        <video
                          src={src}
                          controls
                          className="w-full"
                          style={{ maxHeight: "480px" }}
                        />
                      </div>
                    </div>
                  ) : null;
                })()}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
