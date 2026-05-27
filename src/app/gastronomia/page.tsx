"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { pratosTipicos } from "@/lib/data";
import { gastronomiaApi } from "@/lib/api/gastronomia";
import type { Gastronomia } from "@/lib/api/types";
// 1. IMPORTAMOS A FUNÇÃO SALVADORA AQUI:
import { safeMediaUrl } from "@/lib/safeMediaUrl"; 

export default function GastronomiaPage() {
  const [restaurantes, setRestaurantes] = useState<Gastronomia[]>([]);
  const [loading, setLoading] = useState(true);
  const [erroAtivo, setErroAtivo] = useState<boolean>(false);

  useEffect(() => {
    const fetchGastronomia = async () => {
      try {
        const data = await gastronomiaApi.getAll();
        const aprovados = data.filter(rest => rest.status === "APROVADO");
        
        setRestaurantes(aprovados); 
        setErroAtivo(false);
      } catch (error) {
        console.error("Erro ao buscar restaurantes da API:", error);
        setErroAtivo(true);
      } finally {
        setLoading(false);
      }
    };

    fetchGastronomia();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <section className="relative flex h-[55vh] items-center justify-center overflow-hidden pt-20">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/images/gastronomia.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/30 to-black/30" />
        <div className="relative z-10 px-4 text-center text-primary-foreground">
          <p className="mb-3 text-sm uppercase tracking-[0.3em]">
            Sabores de Saquarema
          </p>
          <h1 className="font-display text-5xl font-bold uppercase md:text-7xl">
            Gastronomia
          </h1>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <h2 className="font-display text-4xl font-bold uppercase text-foreground">
          Restaurantes
        </h2>
        
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {loading ? (
            <p className="col-span-full text-center text-muted-foreground">
              Preparando o cardápio com os melhores restaurantes...
            </p>
          ) : erroAtivo ? (
            <div className="col-span-full rounded-xl border border-border bg-card p-8 text-center shadow-sm">
              <p className="font-display text-2xl font-bold text-foreground">
                Ops! Tivemos um imprevisto.
              </p>
              <p className="mt-2 text-muted-foreground">
                Não conseguimos carregar os restaurantes no momento. Por favor, recarregue a página ou tente novamente mais tarde.
              </p>
            </div>
          ) : restaurantes.length === 0 ? (
            <div className="col-span-full py-10 text-center">
              <p className="font-display text-2xl text-foreground">
                Novos sabores chegando em breve!
              </p>
              <p className="mt-2 text-muted-foreground">
                Estamos a selecionar os melhores estabelecimentos de Saquarema para você. Volte logo para conferir as novidades.
              </p>
            </div>
          ) : (
            restaurantes.map((restaurante, i) => (
              <motion.article
                key={restaurante.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="overflow-hidden rounded-2xl border border-border bg-card"
              >
                {/* 3. USAMOS A FUNÇÃO AQUI PARA PUXAR A IMAGEM DO BACKEND: */}
                <div
                  className="h-52 bg-cover bg-center"
                  style={{ backgroundImage: `url(${safeMediaUrl(restaurante.logoUrl) || '/images/gastronomia.jpg'})` }}
                />
                <div className="p-5">
                  <h3 className="font-display text-2xl font-bold uppercase">
                    {restaurante.nome}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {restaurante.especialidade 
                      ? `Especialidade: ${restaurante.especialidade}` 
                      : `Endereço: ${restaurante.endereco}`}
                  </p>
                  <button className="mt-4 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90">
                    Ver detalhes
                  </button>
                </div>
              </motion.article>
            ))
          )}
        </div>
      </section>

      <section className="bg-muted px-4 py-14 text-primary-foreground">
        <div className="container mx-auto">
          <h2 className="font-display text-4xl font-bold uppercase text-primary">
            Pratos Típicos
          </h2>
          <ul className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {pratosTipicos.map((prato) => (
              <li
                key={prato.nome}
                className="rounded-xl border border-border bg-card p-6"
              >
                <h3 className="font-display text-xl uppercase text-primary">
                  {prato.nome}
                </h3>
                <p className="mt-2 text-muted-foreground">{prato.descricao}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}