"use client";

import { motion } from "framer-motion";
import { pratosTipicos } from "@/lib/data";

const restaurantes = [
  {
    nome: "Casa do Mar",
    descricao: "Frutos do mar frescos com vista para a Praia de Itaúna.",
    imagem: "/images/itauna-surf.jpg",
  },
  {
    nome: "Bistrô da Lagoa",
    descricao:
      "Cozinha contemporânea com ingredientes locais e ambiente intimista.",
    imagem: "/images/igreja-nazare.jpg",
  },
  {
    nome: "Sabores de Saquá",
    descricao: "Pratos regionais e atendimento familiar no centro histórico.",
    imagem: "/images/templo-rock.jpg",
  },
];

export default function GastronomiaPage() {
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
          {restaurantes.map((restaurante, i) => (
            <motion.article
              key={restaurante.nome}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div
                className="h-52 bg-cover bg-center"
                style={{ backgroundImage: `url(${restaurante.imagem})` }}
              />
              <div className="p-5">
                <h3 className="font-display text-2xl font-bold uppercase">
                  {restaurante.nome}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {restaurante.descricao}
                </p>
                <button className="mt-4 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90">
                  Ver detalhes
                </button>
              </div>
            </motion.article>
          ))}
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
                <p className="text-muted-foreground mt-2">{prato.descricao}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
