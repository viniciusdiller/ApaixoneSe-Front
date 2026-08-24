"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  MapPin,
} from "lucide-react";
import { motion } from "framer-motion";
import type { RoteiroMeta } from "@/lib/roteiros";
import { atividadesApi } from "@/lib/api";
import type { Atividade } from "@/lib/api";
import { useVisitas } from "@/hooks/useVisitas";
import { safeMediaUrl } from "@/lib/safeMediaUrl";
import { trackClick } from "@/lib/trackClick";

function AtividadeSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-border bg-card">
      <div className="h-48 bg-muted" />
      <div className="p-5">
        <div className="h-5 w-2/3 rounded bg-muted" />
        <div className="mt-3 h-4 w-1/2 rounded bg-muted" />
        <div className="mt-5 h-12 rounded bg-muted" />
        <div className="mt-5 h-8 w-32 rounded-full bg-muted" />
      </div>
    </div>
  );
}

export function AtividadesClient({ roteiro }: { roteiro: RoteiroMeta }) {
  const router = useRouter();
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

  useEffect(() => {
    trackClick("roteiros", roteiro.slug);
  }, [roteiro.slug]);

  const abrirAtividade = (atividade: Atividade) => {
    router.push(`/roteiros/${roteiro.slug}/atividades/${atividade.id}`);
  };

  return (
    <main className="min-h-screen bg-background">
      <section className="relative flex min-h-[45vh] items-end overflow-hidden px-4 pb-10 pt-28 sm:px-6">
        <div className="absolute inset-0">
          <Image
            src={roteiro.imagem}
            alt={roteiro.label}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-6xl text-white">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 rounded-full border-2 border-white/70 px-4 py-2 text-sm font-semibold transition-colors hover:bg-white hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Início
          </Link>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/75">
            Roteiro
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold uppercase leading-tight sm:text-6xl">
            {roteiro.label}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">
            {roteiro.descricao}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
            Explore o roteiro
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold uppercase text-foreground sm:text-4xl">
            Atrativos
          </h2>
          <p className="mt-3 text-muted-foreground">
            Encontre experiências, lugares e atividades para aproveitar este
            roteiro. Clique em um atrativo para abrir sua página completa.
          </p>
        </div>

        {loading && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AtividadeSkeleton />
            <AtividadeSkeleton />
            <AtividadeSkeleton />
            <AtividadeSkeleton />
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-5 text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm">
              Não foi possível carregar os atrativos deste roteiro. Tente
              novamente mais tarde.
            </p>
          </div>
        )}

        {!loading && !error && atividades.length === 0 && (
          <div className="rounded-2xl border border-border bg-card px-6 py-16 text-center">
            <MapPin className="mx-auto h-10 w-10 text-primary/40" />
            <p className="mt-4 text-muted-foreground">
              Nenhum atrativo foi cadastrado para este roteiro ainda.
            </p>
          </div>
        )}

        {!loading && !error && atividades.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {atividades.map((atividade, i) => {
              const visitado = atividadesVisitadas.has(atividade.id);
              const mediaUrl = safeMediaUrl(atividade.logoUrl);
              const hasMap =
                atividade.latitude != null && atividade.longitude != null;

              return (
                <motion.article
                  key={atividade.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  role="link"
                  tabIndex={0}
                  aria-label={`Abrir página de ${atividade.titulo}`}
                  onClick={() => abrirAtividade(atividade)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      abrirAtividade(atividade);
                    }
                  }}
                  className="group block cursor-pointer overflow-hidden rounded-2xl border border-border bg-card text-left transition-shadow hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <div className="relative h-48 overflow-hidden bg-primary/20">
                    {mediaUrl && (
                      <Image
                        src={mediaUrl}
                        alt={atividade.titulo}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                    {hasMap && (
                      <a
                        href={`https://maps.google.com/?q=${atividade.latitude},${atividade.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(event) => event.stopPropagation()}
                        className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-background/85 px-2.5 py-1.5 text-xs font-semibold text-primary shadow-sm backdrop-blur-sm transition-colors hover:bg-primary hover:text-primary-foreground"
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        Ver no mapa
                      </a>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-display text-xl font-bold uppercase text-foreground transition-colors group-hover:text-primary">
                          {atividade.titulo}
                        </h3>
                        {atividade.local && (
                          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">{atividade.local}</span>
                          </div>
                        )}
                      </div>
                      <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                    </div>

                    <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                      {atividade.descricao}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {isLogado && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleAtividade(atividade.id);
                          }}
                          aria-label={
                            visitado
                              ? "Remover check-in"
                              : "Marcar como realizada"
                          }
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                            visitado
                              ? "bg-green-50 text-green-700 hover:bg-green-100"
                              : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
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
                      <span className="text-xs font-semibold text-muted-foreground transition-colors group-hover:text-primary">
                        Ver detalhes
                      </span>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
