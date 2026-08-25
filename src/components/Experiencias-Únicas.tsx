"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const roteiros = [
  {
    slug: "a-pe",
    label: "A Pé",
    descricao:
      "Trilhas e percursos para explorar Saquarema com contato direto com a natureza",
    imagem: "/images/roteiros/a_pe.jpeg",
    span: "",
  },
  {
    slug: "esporte-e-aventura",
    label: "Esporte e Aventura",
    descricao:
      "Surf, kitesurf, vôlei e adrenalina no destino esportivo mais famoso do Brasil",
    imagem: "/images/roteiros/esporte.jpeg",
    span: "md:col-span-2",
  },
  {
    slug: "de-praias",
    label: "Praias e Lagoas",
    descricao: "As praias de Saquarema, cada uma com uma personalidade única",
    imagem: "/images/roteiros/praia.jpeg",
    span: "",
  },
  {
    slug: "cultural",
    label: "Cultural",
    descricao: "História, arte e fé que moldaram a identidade de Saquarema",
    imagem: "/images/roteiros/cultural.jpeg",
    span: "",
  },
  {
    slug: "religioso",
    label: "Religioso",
    descricao: "Lugares sagrados de grande beleza e tradição devocional",
    imagem: "/images/roteiros/religioso.jpeg",
    span: "",
  },
  {
    slug: "rural",
    label: "Rural",
    descricao: "Fazendas, gastronomia do campo e tradições do interior",
    imagem: "/images/roteiros/rural.jpeg",
    span: "",
  },
  {
    slug: "ecologico",
    label: "Ecológico",
    descricao: "Lagoas, restingas e fauna local para os amantes do ecoturismo",
    imagem: "/images/roteiros/ecologico.jpeg",
    span: "",
  },
];

export function BentoGrid() {
  return (
    <section className="px-4 pb-12">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="mb-4 text-center font-display text-4xl font-bold uppercase text-foreground md:text-5xl">
            Roteiros de Experiências Únicas
          </h2>
          <p className="mx-auto mb-12 max-w-xl text-center text-muted-foreground">
            Descubra o que faz de Saquarema um destino inesquecível
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-4">
          {roteiros.map((roteiro, i) => (
            <motion.div
              key={roteiro.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className={roteiro.span}
            >
              <Link
                href={`/roteiros/${roteiro.slug}`}
                className="group relative flex min-h-[220px] w-full overflow-hidden rounded-2xl"
              >
                <Image
                  src={roteiro.imagem}
                  alt={roteiro.label}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent transition-opacity group-hover:from-black/85" />

                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="font-display text-xl font-bold uppercase text-white drop-shadow md:text-2xl">
                    {roteiro.label}
                  </h3>
                  <p className="mt-1 text-sm text-white/80">
                    {roteiro.descricao}
                  </p>
                </div>

                <div className="absolute bottom-4 right-4 opacity-0 transition-opacity group-hover:opacity-100">
                  <ArrowRight className="h-6 w-6 text-accent" />
                </div>

                {/* Linha accent no hover, igual ao padrão do navbar */}
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-accent transition-all duration-500 group-hover:w-full" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
