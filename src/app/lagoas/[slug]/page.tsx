"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, notFound } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { pontosAguaApi } from "@/lib/api";
import type { PontoAgua } from "@/lib/api";
import { safeMediaUrl } from "@/lib/safeMediaUrl";

export default function LagoaDetalhesPage() {
  const { slug } = useParams<{ slug: string }>();
  const [lagoa, setLagoa] = useState<PontoAgua | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    pontosAguaApi
      .getBySlug(slug)
      .then(setLagoa)
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

  if (erro || !lagoa) notFound();

  const src = safeMediaUrl(lagoa.imagemUrl);

  return (
    <main className="min-h-screen bg-background pb-16">
      {/* Título e Localização */}
      <section className="bg-primary px-4 pb-12 pt-32">
        <div className="container mx-auto max-w-4xl">
          <Link
            href="/praias"
            className="mb-4 inline-flex items-center gap-1 text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para Praias
          </Link>
          <h1 className="font-display text-4xl font-bold uppercase text-primary-foreground md:text-6xl">
            {lagoa.nome}
          </h1>
          <p className="mt-2 text-primary-foreground/80">
            {lagoa.descricaoCurta}
          </p>
        </div>
      </section>

      <div className="container mx-auto max-w-4xl px-4 mt-10">
        {/* Imagem de Destaque */}
        {src && (
          <div className="relative mb-8 h-[40vh] w-full overflow-hidden rounded-3xl md:h-[60vh]">
            <Image
              src={src}
              alt={lagoa.nome}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Tags / Filtros */}
        {(lagoa.filtros ?? []).length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {(lagoa.filtros ?? []).map((filtro) => (
              <span
                key={filtro}
                className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold uppercase text-primary"
              >
                {filtro.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        )}

        {/* Descrição Completa */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold">Sobre a Lagoa</h2>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
            {lagoa.descricao}
          </p>
        </div>
      </div>
    </main>
  );
}
