"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { servicoTuristaApi } from "@/lib/api";
import type { ServicoTurista } from "@/lib/api";
import { ServicoTuristaCard } from "@/components/servicos/ServicoTuristaCard";

function CardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-border bg-card">
      <div className="h-48 bg-muted" />
      <div className="flex flex-col gap-3 p-5">
        <div className="h-5 w-2/3 rounded bg-muted" />
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-5/6 rounded bg-muted" />
        <div className="mt-2 flex gap-2">
          <div className="h-8 w-32 rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  );
}

export default function LocadorasPage() {
  const [servicos, setServicos] = useState<ServicoTurista[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    servicoTuristaApi
      .getAll()
      .then((data) =>
        setServicos(
          data.filter(
            (s) => s.status === "APROVADO" && s.tipo === "LOCADORA_VEICULOS"
          )
        )
      )
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <section className="relative overflow-hidden bg-primary px-4 pb-16 pt-32">
        <span
          aria-hidden
          className="absolute right-8 top-1/2 -translate-y-1/2 select-none text-[160px] opacity-10"
        >
          🚗
        </span>
        <div className="container relative z-10 mx-auto">
          <Link
            href="/servicos"
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2 text-sm text-primary-foreground/80 transition-colors hover:bg-primary-foreground/20 hover:text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Serviços
          </Link>
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-primary-foreground/60">
            Mobilidade e liberdade
          </p>
          <h1 className="font-display text-5xl font-bold uppercase text-primary-foreground drop-shadow-lg md:text-6xl">
            Locadoras de Veículos
          </h1>
          <p className="mt-4 max-w-xl text-lg text-primary-foreground/80">
            Alugue carros, motos ou bicicletas e explore o destino no seu
            próprio ritmo.
          </p>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="container mx-auto max-w-6xl">
          {!loading && !error && servicos.length > 0 && (
            <p className="mb-8 text-sm text-muted-foreground">
              {servicos.length}{" "}
              {servicos.length === 1
                ? "locadora encontrada"
                : "locadoras encontradas"}
            </p>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
              <AlertCircle className="mb-4 h-10 w-10 text-destructive/60" />
              <p className="text-base font-medium">
                Não foi possível carregar as locadoras.
              </p>
              <p className="mt-1 text-sm">
                Verifique sua conexão e tente novamente.
              </p>
            </div>
          )}

          {loading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          )}

          {!loading && !error && servicos.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
              <span className="mb-3 text-5xl">🚗</span>
              <p className="text-base font-medium">
                Nenhuma locadora disponível no momento.
              </p>
              <p className="mt-1 text-sm">
                Em breve novos parceiros serão adicionados.
              </p>
            </div>
          )}

          {!loading && !error && servicos.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {servicos.map((s, i) => (
                <ServicoTuristaCard key={s.id} servico={s} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
