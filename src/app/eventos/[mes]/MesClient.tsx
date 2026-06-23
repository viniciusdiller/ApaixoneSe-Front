"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  AlertCircle,
  X,
} from "lucide-react";
import type { MesData } from "@/lib/eventos";
import type { Evento } from "@/lib/api";
import { safeMediaUrl } from "@/lib/safeMediaUrl";

function formatarData(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return isoDate;
  }
}

interface Props {
  mesAtual: MesData;
  eventos: Evento[];
  error?: boolean;
}

export default function MesClient({ mesAtual, eventos, error }: Props) {
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);

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
                    onClick={() => setSelectedEvento(evento)}
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

                    <div className="flex w-full flex-col items-center justify-center rounded-xl bg-primary/5 px-6 py-4 text-primary sm:w-auto sm:min-w-[140px]">
                      <CalendarDays className="mb-2 h-6 w-6 text-accent" />
                      <span className="font-display font-semibold text-center leading-tight">
                        {formatarData(evento.data)}
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelectedEvento(null);
          }}
        >
          <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-white/20 bg-card shadow-2xl">
            <div
              className="relative min-h-[420px] p-6 sm:p-8"
              style={{
                backgroundImage: safeMediaUrl(selectedEvento.fotoUrl)
                  ? `url(${safeMediaUrl(selectedEvento.fotoUrl)})`
                  : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
              <button
                type="button"
                onClick={() => setSelectedEvento(null)}
                className="absolute right-4 top-4 z-20 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60"
                aria-label="Fechar detalhes do evento"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="relative z-10 flex h-full min-h-[360px] flex-col justify-end">
                <p className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-white/90">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatarData(selectedEvento.data)}
                </p>
                <h3 className="font-display text-3xl font-bold uppercase text-white sm:text-4xl">
                  {selectedEvento.titulo}
                </h3>
                {selectedEvento.local && (
                  <div className="mt-3 flex items-center gap-2 text-white/90">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm font-medium sm:text-base">
                      {selectedEvento.local}
                    </span>
                  </div>
                )}
                {selectedEvento.descricao && (
                  <p className="mt-5 max-w-2xl rounded-xl border border-white/15 bg-black/35 p-4 text-sm leading-relaxed text-white/95 sm:text-base">
                    {selectedEvento.descricao}
                  </p>
                )}
                {!safeMediaUrl(selectedEvento.fotoUrl) && (
                  <p className="mt-5 max-w-2xl rounded-xl border border-white/15 bg-black/35 p-4 text-sm leading-relaxed text-white/95 sm:text-base">
                    {selectedEvento.descricao || "Evento sem foto cadastrada."}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
