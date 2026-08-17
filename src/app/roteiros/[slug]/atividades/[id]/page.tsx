"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, notFound } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Loader2,
  MapPin,
} from "lucide-react";
import { atividadesApi } from "@/lib/api";
import type { Atividade } from "@/lib/api";
import { getRoteiroBySlug } from "@/lib/roteiros";
import { safeMediaUrl } from "@/lib/safeMediaUrl";
import { useVisitas } from "@/hooks/useVisitas";

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted p-3">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

export default function AtividadeDetalhesPage() {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const roteiro = getRoteiroBySlug(slug);
  const [atividade, setAtividade] = useState<Atividade | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);
  const { atividadesVisitadas, isLogado, toggleAtividade } = useVisitas();

  useEffect(() => {
    if (!roteiro) return;

    atividadesApi
      .getById(id)
      .then((data) => {
        if (data.roteiro !== roteiro.enum) {
          setErro(true);
          return;
        }
        setAtividade(data);
      })
      .catch(() => setErro(true))
      .finally(() => setLoading(false));
  }, [id, roteiro]);

  if (!roteiro) notFound();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    );
  }

  if (erro || !atividade) notFound();

  const src = safeMediaUrl(atividade.logoUrl);
  const visitado = atividadesVisitadas.has(atividade.id);
  const hasMap = atividade.latitude != null && atividade.longitude != null;

  return (
    <main className="min-h-screen bg-background pb-16">
      <section className="bg-primary px-4 pb-12 pt-32 text-primary-foreground">
        <div className="mx-auto max-w-4xl">
          <Link
            href={`/roteiros/${roteiro.slug}`}
            className="mb-5 inline-flex items-center gap-1 rounded-full border border-primary-foreground/40 px-4 py-2 text-sm transition-colors hover:bg-primary-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para {roteiro.label}
          </Link>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground/75">
            {roteiro.label}
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold uppercase leading-tight sm:text-6xl">
            {atividade.titulo}
          </h1>
          {atividade.local && (
            <div className="mt-5 flex items-center gap-2 text-primary-foreground/85">
              <MapPin className="h-5 w-5" />
              <span>{atividade.local}</span>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4">
        <div className="relative mt-10 h-64 w-full overflow-hidden rounded-2xl bg-muted shadow-xl md:h-96">
          {src ? (
            <Image
              src={src}
              alt={atividade.titulo}
              fill
              priority
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-primary/5">
              <MapPin className="h-24 w-24 text-primary/20" />
            </div>
          )}
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-[1fr_auto] md:items-start">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 font-display text-2xl font-bold uppercase text-foreground">
              Informações Práticas
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {atividade.local && (
                <InfoItem label="Localização" value={atividade.local} />
              )}
              <InfoItem label="Roteiro" value={roteiro.label} />
            </div>
            {hasMap && (
              <div className="mt-5">
                <a
                  href={`https://maps.google.com/?q=${atividade.latitude},${atividade.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-primary bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <MapPin className="h-4 w-4" />
                  Ver no mapa
                </a>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 md:min-w-52">
            {isLogado && (
              <button
                type="button"
                onClick={() => toggleAtividade(atividade.id)}
                className={`inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition-colors ${
                  visitado
                    ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                    : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
                }`}
              >
                {visitado ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
                {visitado ? "Fiz esta!" : "Marcar como realizada"}
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 font-display text-2xl font-bold uppercase text-foreground">
            Sobre o Atrativo
          </h2>
          <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
            {atividade.descricao ||
              "Nenhuma descrição detalhada disponível para este atrativo."}
          </p>
        </div>
      </section>
    </main>
  );
}
