"use client";

import { motion } from "framer-motion";

const eventosCulturais = [
  "Casa da Pedra",
  "Teatro Mario Lagos",
  "Museu do Sambaqui",
];

export default function CulturaPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative flex h-[55vh] items-center justify-center overflow-hidden pt-20">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/images/igreja-nazare.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/30 to-black/30" />
        <div className="relative z-10 px-4 text-center text-primary-foreground">
          <p className="mb-3 text-sm uppercase tracking-[0.3em]">
            Tradição e Identidade
          </p>
          <h1 className="font-display text-5xl font-bold uppercase md:text-7xl">
            Cultura
          </h1>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <h2 className="font-display text-4xl font-bold uppercase text-foreground">
          Lugares Culturais
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          {eventosCulturais.map((evento, i) => (
            <motion.article
              key={evento}
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-border bg-card p-6"
            >
              <h3 className="font-display text-2xl uppercase">{evento}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Programação com música, dança, gastronomia e valorização da
                cultura local.
              </p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="bg-muted px-4 py-14">
        <div className="container mx-auto grid grid-cols-1 gap-6 md:grid-cols-2">
          <article className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-3xl uppercase text-primary">
              História de Saquarema
            </h2>
            <p className="mt-3 text-muted-foreground">
              Das tradições caiçaras ao título de Capital Nacional do Surf,
              Saquarema reúne patrimônio histórico, religiosidade e contato
              intenso com o mar.
            </p>
          </article>
          <article className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-3xl uppercase text-primary">
              Destaques Visuais
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                "/images/hero-saquarema.jpg",
                "/images/volei-cbv.jpg",
                "/images/templo-rock.jpg",
                "/images/itauna-surf.jpg",
              ].map((imagem) => (
                <div
                  key={imagem}
                  className="h-28 rounded-md bg-cover bg-center"
                  style={{ backgroundImage: `url(${imagem})` }}
                />
              ))}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
