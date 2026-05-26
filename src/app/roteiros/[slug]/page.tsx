"use client";

import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Clock, MapPin, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { getRoteiroBySlug } from "@/lib/roteiros";
import { atividadesApi } from "@/lib/api";
import type { Atividade } from "@/lib/api";

// Skeleton de card de atividade
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

export default function RoteiroDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const roteiro = getRoteiroBySlug(slug);

  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!roteiro) return;
    setLoading(true);
    setError(false);
    atividadesApi
      .getByRoteiro(roteiro.enum)
      .then(setAtividades)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [roteiro?.enum]);

  if (!roteiro) return notFound();

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

        <div className="absolute right-8 top-1/2 -translate-y-1/2 select-none text-[120px] opacity-10">
          {roteiro.icon}
        </div>

        <div className="container relative z-10 mx-auto">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary-foreground/70 transition-colors hover:text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar \u00e0 p\u00e1gina inicial
          </Link>
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-primary-foreground/60">
            Roteiro
          </p>
          <h1 className="font-display text-5xl font-bold uppercase text-primary-foreground drop-shadow-lg md:text-6xl">
            {roteiro.icon} {roteiro.label}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-primary-foreground/80">
            {roteiro.descricao}
          </p>
        </div>
      </section>

      {/* Atividades */}
      <section className="px-4 py-16">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-display text-3xl font-bold uppercase text-foreground">
              Atividades
            </h2>
            {!loading && !error && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                <MapPin className="h-4 w-4" />
                {atividades.length} {atividades.length === 1 ? "atividade" : "atividades"}
              </span>
            )}
          </div>

          {/* Estado de erro */}
          {error && (
            <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
              <AlertCircle className="mb-4 h-10 w-10 text-destructive/60" />
              <p className="text-base font-medium">N\u00e3o foi poss\u00edvel carregar as atividades.</p>
              <p className="mt-1 text-sm">Verifique sua conex\u00e3o e tente novamente.</p>
            </div>
          )}

          {/* Skeletons de loading */}
          {loading && (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <AtividadeSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Lista real */}
          {!loading && !error && atividades.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
              <span className="mb-3 text-5xl">{roteiro.icon}</span>
              <p className="text-base font-medium">Nenhuma atividade cadastrada ainda.</p>
              <p className="mt-1 text-sm">Em breve novas experi\u00eancias ser\u00e3o adicionadas.</p>
            </div>
          )}

          {!loading && !error && atividades.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {atividades.map((atividade, i) => (
                <motion.div
                  key={atividade.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.06 }}
                  className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <h3 className="font-display text-xl font-semibold uppercase text-card-foreground">
                    {atividade.titulo}
                  </h3>

                  {atividade.local && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span>{atividade.local}</span>
                    </div>
                  )}

                  <p className="mt-3 text-sm text-muted-foreground">
                    {atividade.descricao}
                  </p>

                  {(atividade.latitude != null || atividade.longitude != null) && (
                    <div className="mt-4 flex flex-wrap gap-3">
                      {atividade.latitude != null && atividade.longitude != null && (
                        <a
                          href={`https://maps.google.com/?q=${atividade.latitude},${atividade.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                        >
                          <Clock className="h-3.5 w-3.5" />
                          Ver no mapa
                        </a>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          <div className="mt-12">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border-2 border-primary px-8 py-3 font-display text-sm uppercase tracking-wide text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao In\u00edcio
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
