"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Map,
  Compass,
  Info,
  ArrowRight,
  ArrowLeft,
  Bike,
  Car,
  Banknote,
  FileText,
  House,
} from "lucide-react";
import { catApi, secretariaTurismoApi } from "@/lib/api";
import type { Cat, SecretariaTurismo } from "@/lib/api";
import { motion } from "framer-motion";
import { BusinessPartnerCta } from "@/components/business-partner-cta";

function truncateWords(text: string, max = 10): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= max) return text;
  return words.slice(0, max).join(" ") + "…";
}

export default function ServicosPage() {
  const router = useRouter();
  const [cat, setCat] = useState<Cat | null>(null);
  const [catLoading, setCatLoading] = useState(true);
  const [secretaria, setSecretaria] = useState<SecretariaTurismo | null>(null);
  const [secretariaLoading, setSecretariaLoading] = useState(true);
  const [clickedCard, setClickedCard] = useState<string | null>(null);

  useEffect(() => {
    catApi
      .getAll()
      .then((data) => setCat(data[0] ?? null))
      .catch(() => setCat(null))
      .finally(() => setCatLoading(false));

    secretariaTurismoApi
      .getAll()
      .then((data) => setSecretaria(data[0] ?? null))
      .catch(() => setSecretaria(null))
      .finally(() => setSecretariaLoading(false));
  }, []);

  const cards = [
    {
      icon: <Map size={32} />,
      title: "Guias de Turismo",
      description:
        "Conheça as histórias e os segredos do nosso destino com guias credenciados.",
      label: "Ver profissionais",
      href: "/servicos/guias",
    },
    {
      icon: <Compass size={32} />,
      title: "Agências de Turismo",
      description:
        "Pacotes completos, passeios de barco e roteiros personalizados para você.",
      label: "Ver agências",
      href: "/servicos/agencias",
    },
    {
      icon: <Bike size={32} />,
      title: "Esportes & Lazer",
      description:
        "Atividades esportivas, aventura e lazer para toda a família em Saquarema.",
      label: "Ver esportes",
      href: "/servicos/esportes",
    },
    {
      icon: <Car size={32} />,
      title: "Locadoras de Veículos",
      description:
        "Alugue carros, motos ou bicicletas e explore o destino no seu próprio ritmo.",
      label: "Ver locadoras",
      href: "/servicos/locadoras",
    },
    {
      icon: <Banknote size={32} />,
      title: "Casas de Câmbio",
      description:
        "Troque sua moeda com segurança em casas de câmbio credenciadas em Saquarema.",
      label: "Ver casas de câmbio",
      href: "/servicos/casa-de-cambio",
    },
    {
      icon: <FileText size={32} />,
      title: "Taxas de Turismo",
      description:
        "Autorização de acesso de ônibus, micro-ônibus e vans ao município. Saiba as taxas e como emitir.",
      label: "Ver informações",
      href: "/servicos/taxa-de-turismo",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Refatorado com Imagem e Overlay */}
      <section
        className="relative bg-cover bg-center px-4 pb-12 pt-32"
        style={{ backgroundImage: "url('/images/header/servicos.jpg')" }}
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
            Serviços Turísticos
          </h1>
          <p className="mt-4 max-w-xl text-white/80">
            Explore nossa cidade com os melhores profissionais. Encontre guias
            apaixonados, agências de confiança ou tire suas dúvidas no CAT.
          </p>
        </motion.div>
      </section>

      <section className="container mx-auto max-w-5xl px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
          {cards.map((card) => (
            <div
              key={card.href}
              onClick={() => router.push(card.href)}
              className="group relative flex flex-col items-center p-8 rounded-2xl border bg-card shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer text-center"
            >
              <div className="p-4 rounded-full bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
                {card.icon}
              </div>
              <h2 className="text-2xl font-bold mb-2 text-foreground">
                {card.title}
              </h2>
              <p className="text-muted-foreground mb-6 text-sm">
                {card.description}
              </p>
              <div className="mt-auto flex items-center text-primary font-medium text-sm">
                {card.label}
                <ArrowRight
                  size={16}
                  className="ml-2 group-hover:translate-x-1 transition-transform"
                />
              </div>
            </div>
          ))}
        </div>

        {/* ── Secretaria de Esporte, Lazer e Turismo (esq) + CAT (dir) — destaque lado a lado ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Secretaria de Esporte, Lazer e Turismo — esquerda */}
          <div
            onClick={() => router.push("/servicos/secretaria-de-turismo")}
            className="group relative flex flex-col items-center justify-center p-8 rounded-2xl cursor-pointer overflow-hidden transition-all hover:shadow-xl border border-border/50"
          >
            <div
              className="absolute inset-0 bg-center bg-cover transition-transform duration-500 group-hover:scale-110"
              style={{
                backgroundImage: "url('/images/header/sec-turismo.jpg')",
              }}
            />

            <div className="absolute inset-0 bg-black/60 transition-colors duration-300 group-hover:bg-black/70" />

            <div className="relative z-10 flex flex-col items-center transition-transform duration-300 group-hover:-translate-y-1">
              <div className="p-4 rounded-full bg-white/20 text-white mb-4 backdrop-blur-sm">
                <House size={32} />
              </div>

              <h2 className="text-2xl font-bold mb-2 text-white text-center">
                Secretaria Municipal de Esporte, Lazer e Turismo
              </h2>

              <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full mb-4 backdrop-blur-sm">
                Saquarema · RJ
              </span>

              {secretariaLoading && (
                <div className="w-full max-w-md space-y-2 animate-pulse">
                  <div className="h-3 w-full rounded bg-white/30" />
                  <div className="h-3 w-5/6 rounded bg-white/30" />
                </div>
              )}

              {!secretariaLoading && secretaria && (
                <p className="text-white/80 text-sm max-w-xl text-center">
                  {truncateWords(secretaria.textoExplicativo, 10)}
                </p>
              )}

              {!secretariaLoading && !secretaria && (
                <p className="text-white/80 text-sm text-center">
                  Esporte, Lazer e Turismo de Saquarema. Projetos, informações e
                  iniciativas da Secretaria Municipal.
                </p>
              )}

              <div className="mt-4 flex items-center text-secondary font-semibold text-sm">
                Saiba mais
                <ArrowRight
                  size={16}
                  className="ml-2 transition-transform group-hover:translate-x-1"
                />
              </div>
            </div>
          </div>

          {/* CAT — direita */}
          <div
            onClick={() => router.push("/servicos/cat")}
            className="group relative flex flex-col items-center justify-center p-8 rounded-2xl cursor-pointer overflow-hidden transition-all hover:shadow-xl border border-border/50"
          >
            <div
              className="absolute inset-0 bg-center bg-cover transition-transform duration-500 group-hover:scale-110"
              style={{ backgroundImage: "url('/images/header/cat.png')" }}
            />

            <div className="absolute inset-0 bg-black/60 transition-colors duration-300 group-hover:bg-black/70" />

            <div className="relative z-10 flex flex-col items-center transition-transform duration-300 group-hover:-translate-y-1">
              <div className="p-4 rounded-full bg-white/20 text-white mb-4 backdrop-blur-sm">
                <Info size={32} />
              </div>

              <h2 className="text-2xl font-bold mb-2 text-white">CAT</h2>

              <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full mb-4 backdrop-blur-sm">
                Ponto de Informação
              </span>

              {catLoading && (
                <div className="w-full max-w-md space-y-2 animate-pulse">
                  <div className="h-3 w-full rounded bg-white/30" />
                  <div className="h-3 w-5/6 rounded bg-white/30" />
                </div>
              )}

              {!catLoading && cat && (
                <p className="text-white/80 text-sm max-w-xl text-center">
                  {truncateWords(cat.texto, 10)}
                </p>
              )}

              {!catLoading && !cat && (
                <p className="text-white/80 text-sm text-center">
                  Centro de Atendimento ao Turista. Venha nos visitar
                  presencialmente para mapas, dicas e suporte local gratuito.
                </p>
              )}

              <div className="mt-4 flex items-center text-secondary font-semibold text-sm">
                Saiba mais
                <ArrowRight
                  size={16}
                  className="ml-2 transition-transform group-hover:translate-x-1"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <BusinessPartnerCta />
    </div>
  );
}
