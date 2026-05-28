"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, AlertCircle, Info } from "lucide-react";
import { catApi } from "@/lib/api";
import type { Cat } from "@/lib/api";
import { safeMediaUrl } from "@/lib/safeMediaUrl";

export default function CatPage() {
  const [cat, setCat] = useState<Cat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    catApi
      .getAll()
      .then((data) => setCat(data[0] ?? null))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

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
            <span className="inline-block px-3 py-1 bg-primary-foreground/20 text-primary-foreground text-xs font-semibold rounded-full">
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
              {/* Caixa de texto */}
              <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Info size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">
                    Sobre o CAT
                  </h2>
                </div>
                <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                  {cat.texto}
                </p>
              </div>

              {/* Imagem/arquivo */}
              {cat.arquivoUrl && (() => {
                const src = safeMediaUrl(cat.arquivoUrl);
                return src ? (
                  <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                    <div className="relative w-full">
                      <Image
                        src={src}
                        alt="Imagem do CAT"
                        width={900}
                        height={600}
                        className="w-full object-cover"
                        style={{ maxHeight: "500px", objectFit: "cover" }}
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
