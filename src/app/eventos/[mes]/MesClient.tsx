"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";
import type { MesData } from "@/lib/eventos";

export default function MesClient({ mesAtual }: { mesAtual: MesData }) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100 } },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="min-h-screen bg-background"
    >
      <section className="bg-primary px-4 pb-16 pt-32 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="container mx-auto max-w-5xl text-center relative z-10"
        >
          <Link
            href="/eventos"
            className="mb-8 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2 text-sm text-primary-foreground/80 transition-colors hover:bg-primary-foreground/20 hover:text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Eventos
          </Link>
          <h1 className="font-display text-5xl font-bold uppercase text-primary-foreground md:text-7xl">
            {mesAtual.titulo}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-foreground/80 md:text-xl">
            {mesAtual.descricao}
          </p>
        </motion.div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12 text-center font-display text-3xl uppercase text-primary md:text-4xl"
          >
            Programação
          </motion.h2>

          {mesAtual.eventos && mesAtual.eventos.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 gap-6 lg:grid-cols-2"
            >
              {mesAtual.eventos.map((evento, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg sm:flex-row sm:items-center gap-6 relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-accent transform origin-left scale-y-0 transition-transform duration-300 group-hover:scale-y-100" />

                  <div className="flex-1">
                    <h3 className="font-display text-xl font-bold text-foreground md:text-2xl">
                      {evento.nome}
                    </h3>
                    {evento.local && (
                      <div className="mt-3 flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 text-accent" />
                        <span className="text-sm font-medium">
                          {evento.local}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center justify-center rounded-xl bg-primary/5 px-6 py-4 text-primary sm:w-auto w-full sm:min-w-[140px]">
                    <CalendarDays className="mb-2 h-6 w-6 text-accent" />
                    <span className="font-display font-semibold text-center leading-tight">
                      {evento.data}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-16 text-center text-muted-foreground bg-card/50">
              <p className="text-lg">
                A programação detalhada deste mês será divulgada em breve.
              </p>
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
}
