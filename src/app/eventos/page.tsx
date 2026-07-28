"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { eventosApi } from "@/lib/api/eventos";

export default function EventosPage() {
  const router = useRouter();
  const [clickedCard, setClickedCard] = useState<string | null>(null);

  // Novos estados para armazenar as descrições dinâmicas e o status de carregamento
  const [descricoesDynamic, setDescricoesDynamic] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = useState(true);

  // Mantemos apenas o Nome e o Slug. A descrição mockada foi removida.
  const meses = [
    ["Janeiro", "janeiro"],
    ["Fevereiro", "fevereiro"],
    ["Março", "marco"],
    ["Abril", "abril"],
    ["Maio", "maio"],
    ["Junho", "junho"],
    ["Julho", "julho"],
    ["Agosto", "agosto"],
    ["Setembro", "setembro"],
    ["Outubro", "outubro"],
    ["Novembro", "novembro"],
    ["Dezembro", "dezembro"],
  ];

  // Busca e processamento dos eventos
  useEffect(() => {
    async function fetchEventos() {
      try {
        // ATENÇÃO: Verifique se o método de busca da sua API chama-se .getAll() ou .list()
        const eventos = await eventosApi.getAll();

        const agrupados: Record<string, string[]> = {};

        eventos.forEach((evento: any) => {
          // ATENÇÃO: Substitua 'evento.data' e 'evento.titulo' pelas chaves reais do seu banco
          if (evento.data && evento.titulo) {
            const dataEvento = new Date(evento.data);
            const mesIndex = dataEvento.getMonth(); // Retorna 0 para Janeiro, 1 para Fevereiro...

            const slugs = [
              "janeiro",
              "fevereiro",
              "marco",
              "abril",
              "maio",
              "junho",
              "julho",
              "agosto",
              "setembro",
              "outubro",
              "novembro",
              "dezembro",
            ];
            const slugMes = slugs[mesIndex];

            if (!agrupados[slugMes]) agrupados[slugMes] = [];
            agrupados[slugMes].push(evento.titulo);
          }
        });

        // Converte o array de títulos em uma única string separada por vírgulas
        const novasDescricoes: Record<string, string> = {};
        Object.keys(agrupados).forEach((slug) => {
          novasDescricoes[slug] = agrupados[slug].join(", ") + ".";
        });

        setDescricoesDynamic(novasDescricoes);
      } catch (error) {
        console.error("Erro ao carregar eventos:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchEventos();
  }, []);

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
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2 text-sm text-primary-foreground/80 transition-colors hover:bg-primary-foreground/20 hover:text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para página inicial
          </Link>
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
          {meses.map(([titulo, slug]) => (
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
                <p className="mt-2 text-sm text-muted-foreground relative z-10 line-clamp-3">
                  {loading
                    ? "Carregando eventos..."
                    : descricoesDynamic[slug] ||
                      "Fique ligado! Novidades em breve."}
                </p>
              </article>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
