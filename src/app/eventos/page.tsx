"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";

export default function EventosPage() {
  const router = useRouter();
  const [clickedCard, setClickedCard] = useState<string | null>(null);

  const meses = [
    [
      "Janeiro",
      "Abertura do Festival de Verão, shows na Praça do Coração e grandes competições esportivas.",
      "janeiro",
    ],
    [
      "Fevereiro",
      "Mês do Carnaval de Saquarema e encerramento do Festival de Verão.",
      "fevereiro",
    ],
    [
      "Março",
      "Aloha Spirit, Saquarema Beer Fest e o início dos grandes torneios de esportes aquáticos e lutas.",
      "marco",
    ],
    [
      "Abril",
      "A capital nacional do Vôlei de Praia entra em cena, junto com a Tríplice Coroa de Surf.",
      "abril",
    ],
    [
      "Maio",
      "Mês do Saquarema Country Fest, do Saquá MotoRock e de muita adrenalina.",
      "maio",
    ],
    [
      "Junho",
      "O mês mais aguardado do ano com o WSL Vivo Rio Pro, reunindo a elite mundial do surf em Itaúna.",
      "junho",
    ],
    [
      "Julho",
      "Clima de festa julina com o Arraiá da Vila e mais campeonatos de surf e futebol.",
      "julho",
    ],
    [
      "Agosto",
      "Festival Gastronômico, Saquá Blues Rock Festival e o tradicional Círio de Nazareth se aproximando.",
      "agosto",
    ],
    [
      "Setembro",
      "Tradição e fé com o Círio de Nazareth, acompanhados de eventos de surf e gastronomia.",
      "setembro",
    ],
    [
      "Outubro",
      "Mês de conscientização com a Corrida Outubro Rosa e mais Tríplice Coroa de Surf.",
      "outubro",
    ],
    [
      "Novembro",
      "Cultura e esportes em alta com a Feira Literária (FLIS) e a Abertura do Natal Luz.",
      "novembro",
    ],
    [
      "Dezembro",
      "O encanto do Natal Luz ilumina a cidade enquanto encerramos o ano com esportes de base.",
      "dezembro",
    ],
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  };

  const handleCardClick = (slug: string) => {
    setClickedCard(slug);

    setTimeout(() => {
      router.push(`/eventos/${slug}`);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <section className="bg-primary px-4 pb-12 pt-32">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={clickedCard ? { opacity: 0, y: -20 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="container mx-auto text-center"
        >
          <h1 className="font-display text-5xl font-bold uppercase text-primary-foreground md:text-6xl">
            Eventos
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
            Acompanhe os principais eventos esportivos e culturais de Saquarema.
          </p>
        </motion.div>
      </section>

      <section className="container mx-auto px-4 py-16 relative">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        >
          {meses.map(([titulo, desc, slug]) => (
            <motion.div
              key={slug}
              variants={itemVariants}
              animate={
                clickedCard === slug
                  ? {
                      scale: 3,
                      opacity: 0,
                      zIndex: 50,
                      transition: { duration: 0.5, ease: "easeInOut" },
                    }
                  : clickedCard
                    ? { opacity: 0, scale: 0.9, transition: { duration: 0.3 } }
                    : "show"
              }
              onClick={() => handleCardClick(slug)}
              className="block h-full group cursor-pointer relative"
            >
              <article className="h-full rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-primary/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <h2 className="font-display text-2xl uppercase text-primary transition-colors group-hover:text-accent">
                  {titulo}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground relative z-10">
                  {desc}
                </p>
              </article>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
