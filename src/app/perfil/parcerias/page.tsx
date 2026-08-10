"use client";

import Link from "next/link";
import { ArrowLeft, Bed, Utensils, Compass, Sparkles } from "lucide-react";
import { CategoriaCard } from "@/components/perfil/CategoriaCard";

export default function ParceriasPage() {
  return (
    <main className="min-h-screen bg-background pb-16 pt-32">
      <div className="container mx-auto max-w-5xl px-4">
        <Link
          href="/perfil"
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2 text-sm text-muted-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para o Perfil
        </Link>

        <section className="relative overflow-hidden rounded-[32px] border border-border/70 bg-card px-6 py-8 shadow-sm md:px-10 md:py-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(1,105,111,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(218,113,1,0.10),transparent_30%)]" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Solicitação de parceria
              </div>

              <h1 className="font-display text-4xl font-bold uppercase leading-none text-foreground md:text-5xl">
                Cadastrar Negócio
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
                Escolha a categoria que melhor descreve o seu negócio para
                começarmos.
              </p>
            </div>

            <div className="grid max-w-sm grid-cols-2 gap-3 text-xs text-muted-foreground sm:max-w-md">
              <div className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3">
                Envio simples e alinhado à identidade visual do portal.
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3">
                Mesmo fluxo, informações e validações já existentes.
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <CategoriaCard
            href="/perfil/parcerias/hospedagem/novo"
            titulo="Hospedagem"
            descricao="Pousadas, hotéis, hostels, campings e casas de temporada."
            Icone={Bed}
          />

          <CategoriaCard
            href="/perfil/parcerias/gastronomia/novo"
            titulo="Gastronomia"
            descricao="Restaurantes, bares, quiosques, lanchonetes e cafés."
            Icone={Utensils}
          />

          <div className="sm:col-span-2">
            <CategoriaCard
              href="/perfil/parcerias/servico-turista/novo"
              titulo="Serviços ao Turista"
              descricao="Agências de Turismo, guias locais, locadoras de veículos, passeios, esportes e lazer."
              Icone={Compass}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
