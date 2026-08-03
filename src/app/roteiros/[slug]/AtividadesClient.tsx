"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { motion } from "framer-motion";
import type { RoteiroMeta } from "@/lib/roteiros";
import { atividadesApi } from "@/lib/api";
import type { Atividade } from "@/lib/api";
import { useVisitas } from "@/hooks/useVisitas";
import { safeMediaUrl } from "@/lib/safeMediaUrl";

function AtividadeSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-border bg-card p-6">
      <div className="h-5 w-2/3 rounded bg-muted" />
      <div className="mt-3 h-3 w-full rounded bg-muted" />
      <div className="mt-1 h-3 w-5/6 rounded bg-muted" />
      <div className="mt-4 h-6 w-24 rounded-full bg-muted" />
    </div>
  );
}

export function AtividadesClient({ roteiro }: { roteiro: RoteiroMeta }) {
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const { atividadesVisitadas, isLogado, toggleAtividade } = useVisitas();

  useEffect(() => {
    setLoading(true);
    setError(false);
    atividadesApi
      .getByRoteiro(roteiro.enum)
      .then(setAtividades)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [roteiro.enum]);

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative flex min-h-[45vh] items-end overflow-hidden px-4 pb-12 pt-32">
        <Image
          src={roteiro.imagem}
          alt={roteiro.label}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-black/40" />
        <div className="absolute right-8 top-1/2 -translate-y-1/2 select-none text-[120px] opacity-10"></div>
        <div className="container relative z-10 mx-auto">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary-foreground/70 transition-colors hover:text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para página inicial
          </Link>
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-primary-foreground/60">
            Roteiro
          </p>
          <h1 className="font-display text-5xl font-bold uppercase text-primary-foreground drop-shadow-lg md:text-6xl"></h1>
          <p className="mt-4 max-w-xl text-lg text-primary-foreground/80">
            {roteiro.descricao}
          </p>
        </div>
      </section>

      {/* Atividades */}
      <section className="px-4 py-16">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-3xl font-bold uppercase text-foreground">
              Atividades
            </h2>
            <div className="flex items-center gap-3">
              {isLogado && !loading && !error && atividades.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  ✓ Marque as atividades que você já realizou!
                </p>
              )}
              {!loading && !error && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  <MapPin className="h-4 w-4" />
                  {atividades.length}{" "}
                  {atividades.length === 1 ? "atividade" : "atividades"}
                </span>
              )}
            </div>
          </div>

          {error && (
            <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
              <AlertCircle className="mb-4 h-10 w-10 text-destructive/60" />
              <p className="text-base font-medium">
                Não foi possível carregar as atividades.
              </p>
              <p className="mt-1 text-sm">
                Verifique sua conexão e tente novamente.
              </p>
            </div>
          )}

          {loading && (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <AtividadeSkeleton key={i} />
              ))}
            </div>
          )}

          {!loading && !error && atividades.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
              <p className="text-base font-medium">
                Nenhuma atividade cadastrada ainda.
              </p>
              <p className="mt-1 text-sm">
                Em breve novas experiências serão adicionadas.
              </p>
            </div>
          )}

          {!loading && !error && atividades.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {atividades.map((atividade, i) => {
                const visitado = atividadesVisitadas.has(atividade.id);
                return (
                  <motion.div
                    key={atividade.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.06 }}
                    className={`relative rounded-xl border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md ${
                      visitado
                        ? "border-green-400/60 bg-green-50/30 dark:bg-green-950/10"
                        : "border-border"
                    }`}
                  >
                    {/* Badge "Fiz esta!" no canto */}
                    {visitado && (
                      <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-green-500 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow">
                        <CheckCircle2 className="h-3 w-3" />
                        Fiz esta!
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display text-xl font-semibold uppercase text-card-foreground">
                          {atividade.titulo}
                        </h3>

                        {atividade.local && (
                          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span>{atividade.local}</span>
                          </div>
                        )}
                      </div>

                      {atividade.logoUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={safeMediaUrl(atividade.logoUrl)}
                          alt={atividade.titulo}
                          className="h-14 w-14 shrink-0 rounded-full border border-border object-cover"
                        />
                      )}
                    </div>

                    <p className="mt-3 text-sm text-muted-foreground">
                      {atividade.descricao}
                    </p>

                    {/* Ações: mapa + check-in */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {atividade.latitude != null &&
                        atividade.longitude != null && (
                          <a
                            href={`https://maps.google.com/?q=${atividade.latitude},${atividade.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                          >
                            <MapPin className="h-3.5 w-3.5" />
                            Ver no mapa
                          </a>
                        )}

                      {/* Botão check-in — somente logados */}
                      {isLogado && (
                        <button
                          onClick={() => toggleAtividade(atividade.id)}
                          aria-label={
                            visitado
                              ? "Remover check-in"
                              : "Marcar como realizada"
                          }
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200 ${
                            visitado
                              ? "border-green-500 bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950/30 dark:text-green-400"
                              : "border-border bg-background text-muted-foreground hover:border-green-400 hover:text-green-600"
                          }`}
                        >
                          {visitado ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <Circle className="h-3.5 w-3.5" />
                          )}
                          {visitado ? "Fiz esta!" : "Não fiz"}
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          <div className="mt-12">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border-2 border-primary px-8 py-3 font-display text-sm uppercase tracking-wide text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Início
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
