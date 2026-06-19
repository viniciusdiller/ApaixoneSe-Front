"use client";

import Link from "next/link";
import { ArrowLeft, Bed, Utensils } from "lucide-react";
import { CategoriaCard } from "@/components/perfil/CategoriaCard"; 

export default function ParceriasPage() {
  return (
    <main className="min-h-screen bg-background pb-16 pt-32">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Botão de Voltar */}
        <Link
          href="/perfil"
          className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para o Perfil
        </Link>

        {/* Título da Página */}
        <div className="mb-10">
          <h1 className="font-display text-4xl font-bold uppercase text-foreground md:text-5xl">
            Cadastrar Negócio
          </h1>
          <p className="mt-2 text-muted-foreground">
            Escolha a categoria que melhor descreve o seu negócio para começarmos.
          </p>
        </div>

        {/* Cartões de Escolha */}
        <div className="grid gap-6 sm:grid-cols-2">
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
        </div>
      </div>
    </main>
  );
}