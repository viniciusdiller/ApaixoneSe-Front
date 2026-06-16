"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, AlertCircle, Info, Video, ChevronLeft, ChevronRight, MapPin, ImageOff } from "lucide-react";
import { catApi } from "@/lib/api";
import { catMovelApi } from "@/lib/api/cat-movel";
import type { Cat, CatMovel } from "@/lib/api";
import { catMovelMidia } from "@/lib/api/types";
import { safeMediaUrl } from "@/lib/safeMediaUrl";

// ─── Carrossel ───────────────────────────────────────────────────────────────
function Carousel({ urls }: { urls: string[] }) {
  const [idx, setIdx] = useState(0);
  const total = urls.length;
  const prev = () => setIdx((i) => (i - 1 + total) % total);
  const next = () => setIdx((i) => (i + 1) % total);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "ArrowLeft") prev(); if (e.key === "ArrowRight") next(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });
  if (total === 0) return null;
  if (total === 1) {
    const src = safeMediaUrl(urls[0]);
    return src ? (<div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-muted"><Image src={src} alt="Foto do CAT" fill className="object-cover" /></div>) : null;
  }
  const src = safeMediaUrl(urls[idx]);
  return (
    <div className="select-none space-y-3">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-muted">
        {src && <Image src={src} alt={`Foto ${idx + 1}`} fill className="object-cover transition-opacity duration-300" />}
        <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70" aria-label="Anterior"><ChevronLeft size={20} /></button>
        <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70" aria-label="Próxima"><ChevronRight size={20} /></button>
        <span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-0.5 text-xs text-white backdrop-blur-sm">{idx + 1} / {total}</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {urls.map((url, i) => { const s = safeMediaUrl(url); return s ? (<button key={i} onClick={() => setIdx(i)} className={`relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border-2 transition ${i === idx ? "border-primary opacity-100" : "border-transparent opacity-60 hover:opacity-100"}`}><Image src={s} alt={`Thumb ${i + 1}`} fill className="object-cover" /></button>) : null; })}
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
      if (wrapRect.top > top) { box.style.position = "relative"; box.style.top = "0"; }
      else if (wrapRect.bottom - boxH < top) { box.style.position = "absolute"; box.style.top = `${wrap.offsetHeight - boxH}px`; }
      else { box.style.position = "fixed"; box.style.top = `${top}px`; box.style.width = `${wrap.offsetWidth}px`; }
    };
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!src) return null;
  return (
    <div ref={wrapRef} className="relative hidden lg:block">
      <div ref={videoBoxRef} className="w-full">
        <div className="overflow-hidden rounded-2xl border border-border bg-black shadow-lg">
          <div className="flex items-center gap-2 border-b border-border/40 bg-black/60 px-4 py-2"><Video size={14} className="text-white/60" /><span className="text-xs text-white/60">Vídeo</span></div>
          <video src={src} controls className="w-full" style={{ maxHeight: "360px" }} />
        </div>
      </div>
    </div>
  );
}

// ─── Card CAT Móvel ──────────────────────────────────────────────────────────
function CatMovelCard({ item }: { item: CatMovel }) {
  // Deriva mídia a partir dos campos reais do backend
  const { url, type } = catMovelMidia(item);
  const mediaSrc = safeMediaUrl(url);

  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
        {mediaSrc ? (
          type === "video" ? (
            <video src={mediaSrc} muted loop playsInline
              onMouseEnter={(e) => (e.currentTarget as HTMLVideoElement).play()}
              onMouseLeave={(e) => { const v = e.currentTarget as HTMLVideoElement; v.pause(); v.currentTime = 0; }}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <Image src={mediaSrc} alt={item.titulo} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
          )
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/30"><ImageOff size={40} /></div>
        )}
        {type === "video" && mediaSrc && (
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
            <Video size={12} /> Vídeo
          </span>
        )}
      </div>
      <div className="p-5 space-y-1.5">
        <h3 className="font-semibold text-base text-foreground leading-snug">{item.titulo}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{item.descricao}</p>
      </div>
    </article>
  );
}

// ─── Página pública ──────────────────────────────────────────────────────────
export default function CatPage() {
  const [cat, setCat] = useState<Cat | null>(null);
  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState(false);
  const [movel, setMovel] = useState<CatMovel | null>(null);
  const [movelLoading, setMovelLoading] = useState(true);

  useEffect(() => {
    catApi.getAll().then((data) => setCat(data[0] ?? null)).catch(() => setCatError(true)).finally(() => setCatLoading(false));
    catMovelApi.get().then(setMovel).catch(() => setMovel(null)).finally(() => setMovelLoading(false));
  }, []);

  const imagens = cat?.imagensUrl ?? [];
  const hasVideo = !!cat?.videoUrl;

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary px-4 pb-16 pt-32">
        <span aria-hidden className="absolute right-8 top-1/2 -translate-y-1/2 select-none text-[160px] opacity-10">ℹ️</span>
        <div className="container relative z-10 mx-auto">
          <Link href="/servicos" className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2 text-sm text-primary-foreground/80 transition-colors hover:bg-primary-foreground/20 hover:text-primary-foreground">
            <ArrowLeft className="h-4 w-4" />Voltar para Serviços
          </Link>
          <div className="mb-3 inline-flex items-center gap-2">
            <span className="inline-block rounded-full bg-primary-foreground/20 px-3 py-1 text-xs font-semibold text-primary-foreground">Ponto de Informação</span>
          </div>
          <h1 className="font-display text-5xl font-bold uppercase text-primary-foreground drop-shadow-lg md:text-6xl">CAT</h1>
          <p className="mt-4 max-w-xl text-lg text-primary-foreground/80">Centro de Atendimento ao Turista de Saquarema.</p>
        </div>
      </section>

      {/* CAT Fixo */}
      <section className="px-4 py-16">
        <div className="container mx-auto max-w-6xl">
          {catLoading && (
            <div className="animate-pulse space-y-6">
              <div className="h-6 w-40 rounded bg-muted" />
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_420px]">
                <div className="space-y-4"><div className="h-4 w-full rounded bg-muted" /><div className="h-4 w-5/6 rounded bg-muted" /><div className="aspect-[4/3] w-full rounded-2xl bg-muted" /></div>
                <div className="hidden aspect-video rounded-2xl bg-muted lg:block" />
              </div>
            </div>
          )}
          {!catLoading && catError && (
            <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
              <AlertCircle className="mb-4 h-10 w-10 text-destructive/60" />
              <p className="text-base font-medium">Não foi possível carregar as informações do CAT.</p>
              <p className="mt-1 text-sm">Verifique sua conexão e tente novamente.</p>
            </div>
          )}
          {!catLoading && !catError && !cat && (
            <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
              <Info className="mb-4 h-10 w-10 text-muted-foreground/50" />
              <p className="text-base font-medium">Informações do CAT não disponíveis no momento.</p>
            </div>
          )}
          {!catLoading && !catError && cat && (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_420px]">
              <div className="space-y-8">
                <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"><Info size={20} /></div>
                    <h2 className="text-xl font-bold text-foreground">Sobre o CAT</h2>
                  </div>
                  <p className="whitespace-pre-line text-base leading-relaxed text-muted-foreground">{cat.texto}</p>
                </div>
                {imagens.length > 0 && <Carousel urls={imagens} />}
                {hasVideo && cat.videoUrl && (
                  <div className="block lg:hidden">
                    {(() => { const src = safeMediaUrl(cat.videoUrl!); return src ? (<div className="overflow-hidden rounded-2xl border border-border bg-black shadow-sm"><div className="flex items-center gap-2 border-b border-border/40 bg-black/60 px-4 py-2"><Video size={14} className="text-white/60" /><span className="text-xs text-white/60">Vídeo</span></div><video src={src} controls className="w-full" /></div>) : null; })()}
                  </div>
                )}
              </div>
              {hasVideo && cat.videoUrl && <StickyVideo url={cat.videoUrl} />}
            </div>
          )}
        </div>
      </section>

      {/* CAT Móvel — oculto se não configurado */}
      {(movelLoading || movel) && (
        <section className="border-t border-border bg-muted/40 px-4 py-16">
          <div className="container mx-auto max-w-6xl">
            <div className="mb-10 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary"><MapPin size={22} /></div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">CAT Móvel</h2>
                <p className="text-sm text-muted-foreground">Ponto de atendimento itinerante.</p>
              </div>
            </div>
            {movelLoading && (
              <div className="animate-pulse">
                <div className="max-w-2xl rounded-2xl border border-border bg-white overflow-hidden">
                  <div className="aspect-[16/9] bg-muted w-full" />
                  <div className="p-6 space-y-3"><div className="h-5 w-1/2 rounded bg-muted" /><div className="h-4 w-full rounded bg-muted" /><div className="h-4 w-4/5 rounded bg-muted" /></div>
                </div>
              </div>
            )}
            {!movelLoading && movel && (
              <div className="max-w-2xl"><CatMovelCard item={movel} /></div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
