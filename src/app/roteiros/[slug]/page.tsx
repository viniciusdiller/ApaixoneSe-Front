import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Clock, BarChart2, MapPin } from "lucide-react";
import { getRoteiroBySlug, roteiros } from "@/lib/roteiros";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return roteiros.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props) {
  const roteiro = getRoteiroBySlug(params.slug);
  if (!roteiro) return {};
  return {
    title: `${roteiro.label} | Roteiros | Apaixone-se por Saquarema`,
    description: roteiro.descricao,
  };
}

export default function RoteiroDetailPage({ params }: Props) {
  const roteiro = getRoteiroBySlug(params.slug);

  if (!roteiro) notFound();

  return (
    <main className="min-h-screen bg-background">
      {/* Hero do roteiro com a imagem da categoria */}
      <section className="relative flex min-h-[45vh] items-end overflow-hidden px-4 pb-12 pt-32">
        <Image
          src={roteiro.imagem}
          alt={roteiro.label}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-black/40" />

        {/* Ícone decorativo */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 text-[120px] opacity-10 select-none">
          {roteiro.icon}
        </div>

        <div className="container relative z-10 mx-auto">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary-foreground/70 transition-colors hover:text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar à página inicial
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

          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-1.5 text-sm font-medium text-primary-foreground backdrop-blur-sm">
            <MapPin className="h-4 w-4" />
            {roteiro.atividades.length} atividades disponíveis
          </div>
        </div>
      </section>

      {/* Lista de atividades */}
      <section className="px-4 py-16">
        <div className="container mx-auto max-w-5xl">
          <h2 className="mb-8 font-display text-3xl font-bold uppercase text-foreground">
            Atividades
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {roteiro.atividades.map((atividade, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <h3 className="font-display text-xl font-semibold uppercase text-card-foreground">
                  {atividade.nome}
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  {atividade.descricao}
                </p>

                {(atividade.duracao || atividade.dificuldade) && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {atividade.duracao && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        <Clock className="h-3.5 w-3.5" />
                        {atividade.duracao}
                      </span>
                    )}
                    {atividade.dificuldade && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-accent-foreground">
                        <BarChart2 className="h-3.5 w-3.5" />
                        {atividade.dificuldade}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

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
