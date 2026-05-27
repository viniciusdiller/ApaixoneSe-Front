"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { dadosDosMeses } from "@/lib/eventos";
import { eventosApi } from "@/lib/api";
import type { Evento } from "@/lib/api";
import MesClient from "./MesClient";

// Mapa de slug (pt-BR lowercase) para número do mês (1-12)
const MES_NUMERO: Record<string, number> = {
  janeiro: 1,
  fevereiro: 2,
  marco: 3,
  abril: 4,
  maio: 5,
  junho: 6,
  julho: 7,
  agosto: 8,
  setembro: 9,
  outubro: 10,
  novembro: 11,
  dezembro: 12,
};

export default function MesPage() {
  const params = useParams<{ mes: string }>();
  const mes = params?.mes ?? "";

  const mesAtual = dadosDosMeses[mes];
  const mesNumero = MES_NUMERO[mes];

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!mesNumero) return;

    eventosApi
      .getAll()
      .then((data) => {
        const filtrados = data.filter((e) => {
          try {
            const d = new Date(e.data);
            return d.getMonth() + 1 === mesNumero;
          } catch {
            return false;
          }
        });
        // Ordenar por data crescente
        filtrados.sort(
          (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
        );
        setEventos(filtrados);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [mesNumero]);

  if (!mesAtual) {
    notFound();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <section className="bg-primary px-4 pb-16 pt-32">
          <div className="container mx-auto max-w-5xl text-center">
            <div className="mx-auto mb-6 h-8 w-48 animate-pulse rounded-full bg-primary-foreground/20" />
            <div className="mx-auto h-16 w-80 animate-pulse rounded-xl bg-primary-foreground/20" />
            <div className="mx-auto mt-6 h-6 w-96 animate-pulse rounded-lg bg-primary-foreground/10" />
          </div>
        </section>
        <section className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto mb-12 h-10 w-48 animate-pulse rounded-xl bg-muted" />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse flex gap-6 rounded-2xl border border-border bg-card p-6"
                >
                  <div className="flex-1 space-y-3">
                    <div className="h-6 w-3/4 rounded bg-muted" />
                    <div className="h-4 w-full rounded bg-muted" />
                    <div className="h-4 w-1/2 rounded bg-muted" />
                  </div>
                  <div className="h-20 w-32 shrink-0 rounded-xl bg-muted" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return <MesClient mesAtual={mesAtual} eventos={eventos} error={error} />;
}
