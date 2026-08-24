"use client";
import { formatDisplayText } from "@/lib/textDisplay";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { ArrowLeft, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { pontosAguaApi } from "@/lib/api";
import type { PontoAgua } from "@/lib/api";
import { BeachConditions } from "@/components/praia/condicao-praia";
import { safeMediaUrl } from "@/lib/safeMediaUrl";
import Image from "next/image";
import { trackClick } from "@/lib/trackClick";

export default function PraiaDetalhePage() {
  const { slug } = useParams<{ slug: string }>();
  const [praia, setPraia] = useState<PontoAgua | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    pontosAguaApi
      .getBySlug(slug)
      .then((p) => {
        setPraia(p);
        trackClick("praias", slug);
      })
      .catch(() => setErro(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (erro || !praia) notFound();
  const src = safeMediaUrl(praia.imagemUrl);
  function InfoItem({ label, value }: { label: string; value: string }) {
    return (
      <div className="rounded-lg bg-muted p-3">
        <p className="text-xs uppercase text-muted-foreground">{label}</p>
        <p className="mt-1 font-medium capitalize text-foreground">{value}</p>
      </div>
    );
  }

  function InfoBool({ label, value }: { label: string; value: boolean }) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
        {value ? (
          <CheckCircle className="h-4 w-4 text-restinga" />
        ) : (
          <XCircle className="h-4 w-4 text-muted-foreground" />
        )}
        <div>
          <p className="text-xs uppercase text-muted-foreground">{label}</p>
          <p className="mt-0.5 text-sm font-medium text-foreground">
            {value ? "Sim" : "Não"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-primary px-4 pb-12 pt-28">
        <div className="container mx-auto max-w-4xl">
          <Link
            href="/praias"
            className="mb-4 inline-flex items-center gap-1 text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para Praias
          </Link>
          <h1 className="font-display text-4xl font-bold uppercase text-primary-foreground md:text-6xl">
            {praia.nome}
          </h1>
          <p className="mt-2 text-primary-foreground/80">
            {praia.descricaoCurta}
          </p>
        </div>
      </section>

      <div className="container mx-auto max-w-4xl px-4 py-12">
        {src && (
          <div className="relative mb-8 h-[40vh] w-full overflow-hidden rounded-3xl md:h-[60vh]">
            <Image
              src={src}
              alt={praia.nome}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Tags / Filtros */}
        {(praia.filtros ?? []).length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {(praia.filtros ?? []).map((filtro) => (
              <span
                key={filtro}
                className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold uppercase text-primary"
              >
                {filtro.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        )}
        {praia.latitude != null && praia.longitude != null && (
          <BeachConditions lat={praia.latitude} lng={praia.longitude} />
        )}
        <div className="mb-12">
          <h2 className="mb-4 font-display text-2xl font-bold uppercase text-foreground">
            Sobre a Praia
          </h2>
            <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
            {formatDisplayText(praia.descricao)}
          </p>
        </div>

        <div className="mb-12">
          <h2 className="mb-4 font-display text-2xl font-bold uppercase text-foreground">
            Informações Práticas
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {praia.dificuldade && (
              <InfoItem label="Dificuldade" value={praia.dificuldade} />
            )}
            <InfoBool label="Estacionamento" value={praia.estacionamento} />
            <InfoBool label="Quiosques" value={praia.quiosques} />
            <InfoBool label="Acessível" value={praia.acessivel} />
          </div>
        </div>
      </div>
    </div>
  );
}
