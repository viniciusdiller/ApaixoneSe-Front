"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  AlertCircle,
  Building2,
  Video,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { secretariaTurismoApi } from "@/lib/api";
import type { SecretariaTurismo } from "@/lib/api";
import { safeMediaUrl } from "@/lib/safeMediaUrl";

// ─── Carrossel ───────────────────────────────────────────────────────────────
function Carousel({ urls }: { urls: string[] }) {
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
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-muted">
        <Image src={src} alt="Foto da Secretaria" fill className="object-cover" />
      </div>
    ) : null;
  }

  const src = safeMediaUrl(urls[idx]);
  return (
    <div className="select-none space-y-3">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-muted">
        {src && (
          <Image
            src={src}
            alt={`Foto ${idx + 1}`}
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
                  ? "border-[#006494] opacity-100"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image src={s} alt={`Thumb ${i + 1}`} fill className="object-cover" />
            </button>
          ) : null;
        })}
      </div>
    </div>
  );
}

// ─── Vídeo sticky ────────────────────────────────────────────────────────────
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
          <video src={src} controls className="w-full" style={{ maxHeight: "360px" }} />
        </div>
      </div>
    </div>
  );
}

// ─── Página pública ───────────────────────────────────────────────────────────
export default function SecretariaTurismoPage() {
  const [secretaria, setSecretaria] = useState<SecretariaTurismo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    secretariaTurismoApi
      .getAll()
      .then((data) => setSecretaria(data[0] ?? null))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const imagens = secretaria?.imagensUrl ?? [];
  const hasVideo = !!secretaria?.videoUrl;

  return (
    <main className="min-h-screen bg-background">
      {/* Hero com gradiente da identidade da Secretaria */}
      <section
        className="relative overflow-hidden px-4 pb-16 pt-32"
        style={{
          background:
            "linear-gradient(135deg, #006494 0%, #0a4a6e 60%, #083a56 100%)",
        }}
      >
        {/* Barra de cores no topo do hero */}
        <div
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{
            background:
              "linear-gradient(90deg, #006494 0%, #da7101 35%, #d19900 65%, #6daa45 100%)",
          }}
        />
        <span
          aria-hidden
          className="absolute right-8 top-1/2 -translate-y-1/2 select-none text-[160px] opacity-10"
        >
          🏛️
        </span>
        <div className="container relative z-10 mx-auto">
          <Link
            href="/servicos"
            className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors"
            style={{
              background: "rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.8)",
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Serviços
          </Link>
          <div className="mb-3 inline-flex items-center gap-2">
            <span
              className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: "rgba(255,255,255,0.18)", color: "#fff" }}
            >
              Saquarema · RJ
            </span>
          </div>
          <h1 className="font-display text-5xl font-bold uppercase text-white drop-shadow-lg md:text-6xl">
            Secretaria de Turismo
          </h1>
          <p className="mt-4 max-w-xl text-lg" style={{ color: "rgba(255,255,255,0.8)" }}>
            Esporte, Lazer e Turismo de Saquarema. Conheça os projetos e
            iniciativas da Secretaria Municipal.
          </p>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="px-4 py-16">
        <div className="container mx-auto max-w-6xl">

          {/* Skeleton */}
          {loading && (
            <div className="animate-pulse space-y-6">
              <div className="h-6 w-40 rounded bg-muted" />
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_420px]">
                <div className="space-y-4">
                  <div className="h-4 w-full rounded bg-muted" />
                  <div className="h-4 w-5/6 rounded bg-muted" />
                  <div className="h-4 w-4/6 rounded bg-muted" />
                  <div className="aspect-[4/3] w-full rounded-2xl bg-muted" />
                </div>
                <div className="hidden aspect-video rounded-2xl bg-muted lg:block" />
              </div>
            </div>
          )}

          {/* Erro */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
              <AlertCircle className="mb-4 h-10 w-10 text-destructive/60" />
              <p className="text-base font-medium">Não foi possível carregar as informações.</p>
              <p className="mt-1 text-sm">Verifique sua conexão e tente novamente.</p>
            </div>
          )}

          {/* Sem dados */}
          {!loading && !error && !secretaria && (
            <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
              <Building2 className="mb-4 h-10 w-10 text-muted-foreground/50" />
              <p className="text-base font-medium">Informações da Secretaria não disponíveis no momento.</p>
            </div>
          )}

          {/* ── Layout split ── */}
          {!loading && !error && secretaria && (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_420px]">
              {/* Coluna esquerda */}
              <div className="space-y-8">
                {/* Texto */}
                <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
                  <div className="mb-5 flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full"
                      style={{ background: "rgba(0,100,148,0.1)", color: "#006494" }}
                    >
                      <Building2 size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Sobre a Secretaria</h2>
                  </div>
                  <p className="whitespace-pre-line text-base leading-relaxed text-muted-foreground">
                    {secretaria.texto}
                  </p>
                </div>

                {/* Carrossel */}
                {imagens.length > 0 && <Carousel urls={imagens} />}

                {/* Vídeo mobile */}
                {hasVideo && secretaria.videoUrl && (
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
              </div>

              {/* Coluna direita: vídeo sticky desktop */}
              {hasVideo && secretaria.videoUrl && (
                <StickyVideo url={secretaria.videoUrl} />
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
