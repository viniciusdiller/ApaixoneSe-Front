"use client";

import { motion } from "framer-motion";
import { roteiros } from "@/lib/roteiros";
import { RoteiroCard } from "./RoteiroCard";

export function RoteirosGrid() {
  return (
    <section className="px-4 py-20">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-muted-foreground">
            Descubra Saquarema
          </p>
          <h1 className="font-display text-4xl font-bold uppercase text-foreground md:text-5xl">
            Roteiros de Viagem
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Escolha um roteiro e mergulhe nas experiências que Saquarema oferece
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roteiros.map((roteiro, i) => (
            <motion.div
              key={roteiro.slug}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
            >
              <RoteiroCard roteiro={roteiro} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
