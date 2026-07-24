"use client";

import Link from "next/link";
import { ArrowLeft, Bed, Utensils, Compass, ChevronRight, Sparkles } from "lucide-react";

const categorias = [
  {
    href: "/perfil/parcerias/hospedagem/novo",
    titulo: "Hospedagem",
    descricao: "Pousadas, hotéis, hostels, campings e casas de temporada.",
    Icone: Bed,
    destaque: null,
  },
  {
    href: "/perfil/parcerias/gastronomia/novo",
    titulo: "Gastronomia",
    descricao: "Restaurantes, bares, quiosques, lanchonetes e cafés.",
    Icone: Utensils,
    destaque: null,
  },
  {
    href: "/perfil/parcerias/servico-turista/novo",
    titulo: "Serviços ao Turista",
    descricao: "Agências, guias locais, locadoras, passeios e esportes.",
    Icone: Compass,
    destaque: "Em alta",
  },
];

export default function ParceriasPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* ── HERO ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/90 via-primary to-secondary/80 pb-20 pt-36">
        {/* decoração de fundo */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-10 right-0 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />
        </div>

        <div className="container relative mx-auto max-w-4xl px-4">
          <Link
            href="/perfil"
            className="mb-8 inline-flex items-center gap-1.5 text-sm text-white/70 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para o Perfil
          </Link>

          {/* badge */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Programa de Parcerias
          </div>

          <h1 className="font-display text-4xl font-bold uppercase tracking-tight text-white md:text-5xl lg:text-6xl">
            Cadastre seu
            <br />
            <span className="text-accent">Negócio</span>
          </h1>
          <p className="mt-4 max-w-lg text-base text-white/75">
            Chegue a milhares de turistas que exploram nossa região. Escolha a categoria do seu negócio para começar.
          </p>
        </div>
      </div>

      {/* ── CARDS ── */}
      <div className="container mx-auto max-w-4xl px-4">
        {/* puxa os cards para cima, sobrepondo o hero */}
        <div className="-mt-10 grid gap-5 sm:grid-cols-2 pb-20">
          {categorias.map(({ href, titulo, descricao, Icone, destaque }) => (
            <Link
              key={href}
              href={href}
              className="group relative flex flex-col rounded-2xl border border-border bg-card p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 last:sm:col-span-2"
            >
              {/* badge de destaque */}
              {destaque && (
                <span className="absolute right-5 top-5 rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
                  {destaque}
                </span>
              )}

              {/* ícone */}
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20 transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:ring-primary">
                <Icone className="h-7 w-7" />
              </div>

              {/* texto */}
              <h2 className="font-display text-2xl font-bold uppercase text-foreground transition-colors group-hover:text-primary">
                {titulo}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {descricao}
              </p>

              {/* rodapé */}
              <div className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-primary opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1">
                Começar cadastro
                <ChevronRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
