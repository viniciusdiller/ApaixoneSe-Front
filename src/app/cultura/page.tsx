"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { locaisCulturais } from "@/lib/data";
import { X } from "lucide-react";
import Image from "next/image";

export default function CulturaPage() {
  // Estado para armazenar qual local foi clicado. Se for null, o pop-up fica fechado.
  const [localSelecionado, setLocalSelecionado] = useState<typeof locaisCulturais[0] | null>(null);

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
            <motion.div
              key={local.nome}
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <article
                onClick={() => setLocalSelecionado(local)}
                className="group relative cursor-pointer overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-primary/50 hover:shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <h3 className="relative z-10 font-display text-2xl uppercase transition-colors group-hover:text-primary">
                  {local.nome}
                </h3>
                <p className="relative z-10 mt-2 text-sm text-muted-foreground line-clamp-3">
                  {local.descricao}
                </p>
                <p className="relative z-10 mt-4 text-sm font-semibold text-primary transition-colors group-hover:text-primary/80">
                  Ler mais &rarr;
                </p>
              </article>
            </motion.div>
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
              até ser eternizada mundialmente como a Capital Nacional do
              Esporte. Aqui, o patrimônio histórico abraça a religiosidade,
              simbolizada pelo Círio mais antigo do Brasil e pela clássica
              Igreja de Nossa Senhora de Nazareth. Seja pelas ondas perfeitas de
              Itaúna, pelo legado musical do Templo do Rock ou pela energia de
              sua natureza, Saquarema oferece uma verdadeira viagem no tempo em
              total sintonia com o mar.
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

      <AnimatePresence>
        {localSelecionado && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLocalSelecionado(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-card shadow-2xl border border-border"
            >
              <button
                onClick={() => setLocalSelecionado(null)}
                className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur-md transition-colors hover:bg-background"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>

              {localSelecionado.imagem && localSelecionado.imagem !== "/images/placeholder.svg" && (
                <div className="relative h-64 w-full bg-primary/20">
                  <Image
                    src={localSelecionado.imagem}
                    alt={localSelecionado.nome}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
              )}

              <div className="p-8">
                <h3 className="font-display text-3xl font-bold uppercase text-foreground">
                  {localSelecionado.nome}
                </h3>
                
                <div className="mt-6 prose prose-lg dark:prose-invert max-w-none">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {localSelecionado.texto || localSelecionado.descricao}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}