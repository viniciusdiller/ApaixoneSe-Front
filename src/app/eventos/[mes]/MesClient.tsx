"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ArrowLeft, CalendarDays, MapPin, AlertCircle, X } from "lucide-react";
import type { MesData } from "@/lib/eventos";
import type { Evento } from "@/lib/api";
import { safeMediaUrl } from "@/lib/safeMediaUrl";
import {
  formatarPeriodoEvento,
  formatarPeriodoEventoCurto,
} from "@/lib/eventoPeriodo";
import { trackClick } from "@/lib/trackClick";

interface Props {
  mesAtual: MesData;
  eventos: Evento[];
  error?: boolean;
  initialEventoId?: string | null;
}

export default function MesClient({
  mesAtual,
  eventos,
  error,
  initialEventoId,
}: Props) {
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);

  // Abre direto o modal do evento vindo por link (ex: carrossel da home,
  // ?evento=<id>) assim que a lista carregar. Se o id não bater com nenhum
  // evento (removido, etc.), não faz nada — mesma tolerância a erro do
  // resto do carrossel.
  useEffect(() => {
    if (!initialEventoId) return;
    const encontrado = eventos.find((e) => e.id === initialEventoId);
    if (!encontrado) return;

    setSelectedEvento(encontrado);

    // Preserva o history.state atual (o App Router guarda ali metadados
    // internos de rota) — sobrescrever com {} deixa o router do Next sem
    // esse estado e ele pode se perder na navegação seguinte.
    const url = new URL(window.location.href);
    url.searchParams.delete("evento");
    window.history.replaceState(
      window.history.state,
      "",
      url.pathname + url.search,
    );
  }, [initialEventoId, eventos]);

  useEffect(() => {
    if (!selectedEvento) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedEvento(null);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [selectedEvento]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100 } },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="min-h-screen bg-background"
    >
      <section className="bg-primary px-4 pb-16 pt-32 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="container mx-auto max-w-5xl text-center relative z-10"
        >
          <Link
            href="/eventos"
            className="mb-4 inline-flex items-center gap-1 text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Eventos
          </Link>
          <h1 className="font-display text-5xl font-bold uppercase text-primary-foreground md:text-7xl">
            {mesAtual.titulo}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-foreground/80 md:text-xl">
            {mesAtual.descricao}
          </p>
        </motion.div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12 text-center font-display text-3xl uppercase text-primary md:text-4xl"
          >
            Programação
          </motion.h2>

          {error && (
            <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
              <AlertCircle className="mb-4 h-10 w-10 text-destructive/60" />
              <p className="text-base font-medium">
                Não foi possível carregar os eventos.
              </p>
              <p className="mt-1 text-sm">
                Verifique sua conexão e tente novamente.
              </p>
            </div>
          )}

          {!error && eventos.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 gap-6 lg:grid-cols-2"
            >
              {eventos.map((evento, index) => (
                <motion.div
                  key={evento.id ?? index}
                  variants={itemVariants}
                  className="group"
                >
                  <button
                    type="button"
                    onClick={() => {
                      trackClick("eventos", evento.id);
                      setSelectedEvento(evento);
                    }}
                    className="relative flex w-full flex-col justify-between gap-6 overflow-hidden rounded-2xl border border-border bg-card p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg sm:flex-row sm:items-center"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-accent transform origin-left scale-y-0 transition-transform duration-300 group-hover:scale-y-100" />

                    <div className="flex-1">
                      <h3 className="font-display text-xl font-bold text-foreground md:text-2xl">
                        {evento.titulo}
                      </h3>
                      {evento.descricao && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {evento.descricao}
                        </p>
                      )}
                      {evento.local && (
                        <div className="mt-3 flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4 text-accent" />
                          <span className="text-sm font-medium">
                            {evento.local}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* LADO DIREITO DO CARD (Imagem + Data) */}
                    <div className="flex w-full shrink-0 flex-col items-center justify-center rounded-xl bg-primary/5 p-4 text-primary sm:w-auto sm:min-w-[140px]">
                      {safeMediaUrl(evento.fotoUrl) ? (
                        <img
                          src={safeMediaUrl(evento.fotoUrl) as string}
                          alt={evento.titulo}
                          className="mb-3 h-24 w-24 rounded-lg object-cover shadow-sm"
                        />
                      ) : (
                        <CalendarDays className="mb-3 h-10 w-10 text-accent/50" />
                      )}
                      <span className="font-display font-semibold text-center leading-tight">
                        {formatarPeriodoEventoCurto(evento.data, evento.dataFim)}
                      </span>
                    </div>
                  </button>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            !error && (
              <div className="rounded-2xl border border-dashed border-border p-16 text-center text-muted-foreground bg-card/50">
                <p className="text-lg">
                  A programação detalhada deste mês será divulgada em breve.
                </p>
              </div>
            )
          )}
        </div>
      </section>

      {selectedEvento && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity"
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelectedEvento(null);
          }}
        >
          <div className="relative flex w-full max-w-3xl max-h-[90vh] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedEvento(null)}
              className="absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all hover:bg-destructive hover:text-white"
              aria-label="Fechar detalhes do evento"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header com Imagem */}
            <div className="relative h-56 w-full shrink-0 bg-muted sm:h-72">
              {safeMediaUrl(selectedEvento.fotoUrl) ? (
                <>
                  <img
                    src={safeMediaUrl(selectedEvento.fotoUrl) as string}
                    alt={selectedEvento.titulo}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary/5">
                  <CalendarDays className="h-20 w-20 text-primary/20" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                </div>
              )}
            </div>

            <div className="relative -mt-8 flex-1 overflow-y-auto px-6 pb-8 sm:-mt-12 sm:px-10 sm:pb-10">
              <div className="mb-5 flex">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary shadow-sm">
                  <CalendarDays className="h-4 w-4" />
                  {formatarPeriodoEvento(selectedEvento.data, selectedEvento.dataFim)}
                </div>
              </div>

              {/* Título */}
              <h3 className="font-display text-3xl font-bold uppercase text-foreground sm:text-5xl leading-tight">
                {selectedEvento.titulo}
              </h3>

              {/* Localização */}
              {selectedEvento.local && (
                <div className="mt-5 inline-flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-2.5 text-muted-foreground border border-border/50">
                  <MapPin className="h-5 w-5 text-accent" />
                  <span className="text-sm font-medium sm:text-base">
                    {selectedEvento.local}
                  </span>
                </div>
              )}

              {/* Descrição */}
              <div className="mt-8 rounded-2xl border border-border bg-muted/30 p-6">
                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Sobre o Evento
                </h4>
                <p className="text-sm leading-relaxed text-foreground/90 sm:text-base whitespace-pre-wrap">
                  {selectedEvento.descricao ||
                    "Nenhuma descrição detalhada disponível para este evento."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
