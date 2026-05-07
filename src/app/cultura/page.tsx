"use client";

import { motion } from "framer-motion";
import { locaisCulturais } from "@/lib/data";

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
          {locaisCulturais.map((local, i) => (
            <motion.article
              key={local.nome}
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-border bg-card p-6"
            >
              <h3 className="font-display text-2xl uppercase">{local.nome}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {local.descricao}
              </p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="bg-muted px-4 py-14">
        <div className="container mx-auto grid grid-cols-1 gap-6 md:grid-cols-2">
          <article className="flex flex-col items-center justify-center text-center rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-3xl uppercase text-primary">
              História de Saquarema
            </h2>
            <p className="mt-5 text-muted-foreground ">
              A história de Saquarema é escrita pelo constante encontro entre a
              terra e o oceano. Das raízes milenares preservadas nos sambaquis e
              a rica herança das pacatas vilas de pescadores, a cidade evoluiu
              até ser eternizada mundialmente como a Capital Nacional do Surf.
              Aqui, o patrimônio histórico abraça a religiosidade, simbolizada
              pelo Círio mais antigo do Brasil e pela clássica Igreja de Nossa
              Senhora de Nazareth. Seja pelas ondas perfeitas de Itaúna, pelo
              legado musical do Templo do Rock ou pela energia de sua natureza,
              Saquarema oferece uma verdadeira viagem no tempo em total sintonia
              com o mar.
            </p>
          </article>
          <article className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-3xl uppercase text-primary">
              Destaques Visuais
            </h2>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                "/images/destaques-visuais/Esquadrilha-Fumaça.jpg",
                "/images/destaques-visuais/WSL.jpg",
                "/images/destaques-visuais/Miguel-Pupo.jpg",
                "/images/destaques-visuais/Fusca.jpg",
                "/images/hero-saquarema.jpeg",
                "/images/destaques-visuais/Meca-Igreja.jpg",
              ].map((imagem) => (
                <div
                  key={imagem}
                  className="h-48 rounded-md bg-cover bg-center"
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
