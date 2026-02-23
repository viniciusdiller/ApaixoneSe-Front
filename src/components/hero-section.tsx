"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/images/teste1.jpeg)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-black/30" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4 font-sans text-sm uppercase tracking-[0.3em] text-primary-foreground/80"
        >
          Bem-vindo ao Templo do Surf
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="font-display text-5xl font-bold uppercase leading-tight text-primary-foreground drop-shadow-lg md:text-7xl lg:text-8xl"
        >
          APAIXONE-SE
          <br />
          PELA Capital Nacional
          <br />
          <span className="text-accent">do Surf</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 max-w-2xl font-sans text-lg text-primary-foreground/90 md:text-xl"
        >
          O encontro perfeito entre a adrenalina das ondas e a paz da natureza.
          Descubra o refúgio da Região dos Lagos.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 flex flex-col gap-4 sm:flex-row"
        >
          <Link
            href="/praias"
            className="rounded-full bg-accent px-8 py-3 font-display text-lg font-semibold uppercase tracking-wide text-accent-foreground shadow-xl transition-transform hover:scale-105"
          >
            Planeje sua Viagem
          </Link>
          <Link
            href="/praias"
            className="rounded-full border-2 border-primary-foreground/60 px-8 py-3 font-display text-lg uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary-foreground/10"
          >
            Conheça as Praias
          </Link>
        </motion.div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
        <ChevronDown className="h-8 w-8 animate-bounce-slow text-primary-foreground/60" />
      </div>
    </section>
  );
}
