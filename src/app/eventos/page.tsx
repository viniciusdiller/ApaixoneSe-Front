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

  const [descricoesDynamic, setDescricoesDynamic] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = useState(true);

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

  function formatarTitulos(titulos: string[]): string {
    if (titulos.length === 0) return "";
    if (titulos.length <= 2) return titulos.join(", ") + ".";
    return `${titulos[0]}, ${titulos[1]}, entre outros.`;
  }

  useEffect(() => {
    async function fetchEventos() {
      try {
        const eventos = await eventosApi.getAll();
        const agrupados: Record<string, string[]> = {};
        eventos.forEach((evento: any) => {
          if (evento.data && evento.titulo) {
            const dataEvento = new Date(evento.data);
            const mesIndex = dataEvento.getMonth();
            const slugMes = slugs[mesIndex];
            if (!agrupados[slugMes]) agrupados[slugMes] = [];
            agrupados[slugMes].push(evento.titulo);
          }
        });
        const novasDescricoes: Record<string, string> = {};
        Object.keys(agrupados).forEach((slug) => {
          novasDescricoes[slug] = formatarTitulos(agrupados[slug]);
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
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
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
      <section
        className="relative bg-cover bg-center px-4 pb-12 pt-32"
        style={{ backgroundImage: "url('/images/hero-saquarema.jpeg')" }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={clickedCard ? { opacity: 0, y: -20 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="container relative z-10 mx-auto"
        >
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/20 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para página inicial
          </Link>
          <h1 className="font-display text-5xl font-bold uppercase text-white md:text-6xl">
            Eventos
          </h1>
          <p className="mt-4 max-w-xl text-white/80">
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
                  ? { scale: 3, opacity: 0, zIndex: 50, transition: { duration: 0.5, ease: "easeInOut" } }
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
