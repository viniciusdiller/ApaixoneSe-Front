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
} from "lucide-react";
import { catApi, secretariaTurismoApi } from "@/lib/api";
import type { Cat, SecretariaTurismo } from "@/lib/api";

function truncateWords(text: string, max = 10): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= max) return text;
  return words.slice(0, max).join(" ") + "…";
}

const LOGO_COLORS = ["#6ab04c", "#da7101", "#006494", "#d63384"];

function ColoredTitle() {
  const words = ["Secretaria", "de", "Turismo"];
  return (
    <h2 className="text-2xl font-bold mb-2 leading-snug">
      {words.map((word, i) => (
        <span key={word} style={{ color: LOGO_COLORS[i % LOGO_COLORS.length] }}>
          {word}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </h2>
  );
}

export default function ServicosPage() {
  const router = useRouter();
  const [cat, setCat] = useState<Cat | null>(null);
  const [catLoading, setCatLoading] = useState(true);
  const [secretaria, setSecretaria] = useState<SecretariaTurismo | null>(null);
  const [secretariaLoading, setSecretariaLoading] = useState(true);

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
      title: "Agências de turismo",
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
      title: "Taxa de Turismo",
      description:
        "Autorização de acesso de ônibus, micro-ônibus e vans ao município. Saiba as taxas e como emitir.",
      label: "Ver informações",
      href: "/servicos/taxa-de-turismo",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary px-4 pb-16 pt-32">
        <span
          aria-hidden
          className="absolute right-8 top-1/2 -translate-y-1/2 select-none text-[160px] opacity-10"
        >
          🗺️
        </span>
        <div className="container relative z-10 mx-auto">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2 text-sm text-primary-foreground/80 transition-colors hover:bg-primary-foreground/20 hover:text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para página inicial
          </Link>
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-primary-foreground/60">
            Saquarema
          </p>
          <h1 className="font-display text-5xl font-bold uppercase text-primary-foreground drop-shadow-lg md:text-6xl">
            Serviços Turísticos
          </h1>
          <p className="mt-4 max-w-xl text-lg text-primary-foreground/80">
            Explore nossa cidade com os melhores profissionais. Encontre guias
            apaixonados, agências de confiança ou tire suas dúvidas no CAT.
          </p>
        </div>
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

        {/* ── Secretaria de Turismo (esq) + CAT (dir) — destaque lado a lado ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Secretaria de Turismo — esquerda, sem ícone */}
          <div
            onClick={() => router.push("/servicos/secretaria-de-turismo")}
            className="group relative flex flex-col items-center p-8 rounded-2xl border border-dashed border-border bg-[#6ab04c]/30
           text-center cursor-pointer hover:shadow-md hover:border-primary/50 transition-all"
          >
            <ColoredTitle />

            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-4">
              Saquarema · RJ
            </span>

            {secretariaLoading && (
              <div className="w-full max-w-md space-y-2 animate-pulse">
                <div className="h-3 w-full rounded bg-muted" />
                <div className="h-3 w-5/6 rounded bg-muted" />
              </div>
            )}

            {!secretariaLoading && secretaria && (
              <p className="text-muted-foreground text-sm max-w-xl">
                {truncateWords(secretaria.textoExplicativo, 10)}
              </p>
            )}

            {!secretariaLoading && !secretaria && (
              <p className="text-muted-foreground text-sm">
                Esporte, Lazer e Turismo de Saquarema. Projetos, informações e
                iniciativas da Secretaria Municipal.
              </p>
            )}

            <div className="mt-4 flex items-center text-primary font-medium text-sm">
              Saiba mais
              <ArrowRight
                size={16}
                className="ml-2 group-hover:translate-x-1 transition-transform"
              />
            </div>
          </div>

          {/* CAT — direita */}
          <div
            onClick={() => router.push("/servicos/cat")}
            className="group relative flex flex-col items-center p-8 rounded-2xl border border-dashed border-border bg-secondary/20 text-center cursor-pointer hover:shadow-md hover:border-primary/50 transition-all"
          >
            <div className="p-4 rounded-full bg-secondary text-secondary-foreground mb-4 group-hover:scale-110 transition-transform">
              <Info size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-foreground">CAT</h2>
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-4">
              Ponto de Informação
            </span>

            {catLoading && (
              <div className="w-full max-w-md space-y-2 animate-pulse">
                <div className="h-3 w-full rounded bg-muted" />
                <div className="h-3 w-5/6 rounded bg-muted" />
              </div>
            )}

            {!catLoading && cat && (
              <p className="text-muted-foreground text-sm max-w-xl">
                {truncateWords(cat.texto, 10)}
              </p>
            )}

            {!catLoading && !cat && (
              <p className="text-muted-foreground text-sm">
                Centro de Atendimento ao Turista. Venha nos visitar
                presencialmente para mapas, dicas e suporte local gratuito.
              </p>
            )}

            <div className="mt-4 flex items-center text-primary font-medium text-sm">
              Saiba mais
              <ArrowRight
                size={16}
                className="ml-2 group-hover:translate-x-1 transition-transform"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
