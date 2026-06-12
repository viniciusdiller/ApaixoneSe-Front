"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Map, Compass, Info, ArrowRight, ArrowLeft, Bike, Car, Banknote, FileText, Landmark } from "lucide-react";
import { catApi } from "@/lib/api";
import { secretariaTurismoApi } from "@/lib/api/secretaria-turismo";
import type { Cat, SecretariaTurismo } from "@/lib/api";

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
  const [secLoading, setSecLoading] = useState(true);

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
      .finally(() => setSecLoading(false));
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
      title: "Agências",
      description:
        "Pacotes completos, passeios de barco e roteiros personalizados para você.",
      label: "Ver agências",
      href: "/servicos/agencias",
    },
    {
      icon: <Bike size={32} />,
      title: "Esporte & Lazer",
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
      title: "Casa de Câmbio",
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
        {/* Cards grade */}
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

        {/* Destaque: CAT + Secretaria de Turismo lado a lado */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {/* CAT */}
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

          {/* Secretaria de Turismo */}
          <div
            onClick={() => router.push("/servicos/secretaria-de-turismo")}
            className="group relative flex flex-col items-center p-8 rounded-2xl border-2 text-center cursor-pointer hover:shadow-lg transition-all overflow-hidden"
            style={{
              borderColor: "transparent",
              background:
                "linear-gradient(135deg, #ffffff 0%, #f0fdf8 100%)",
              boxShadow: "0 0 0 2px transparent",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 8px 30px rgba(0,0,0,0.12)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 0 0 2px transparent";
            }}
          >
            {/* barra de cor no topo inspirada na logo */}
            <div
              className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl"
              style={{
                background:
                  "linear-gradient(90deg, #7DC242 0%, #F5C900 25%, #F47920 50%, #E91E8C 75%, #009FE3 100%)",
              }}
            />

            <div
              className="p-4 rounded-full mb-4 group-hover:scale-110 transition-transform"
              style={{ background: "rgba(125,194,66,0.12)", color: "#7DC242" }}
            >
              <Landmark size={32} />
            </div>

            <h2 className="text-2xl font-bold mb-2 text-foreground">
              Secretaria de Turismo
            </h2>

            <span
              className="inline-block px-3 py-1 text-xs font-semibold rounded-full mb-4 text-white"
              style={{
                background:
                  "linear-gradient(90deg, #F47920, #E91E8C)",
              }}
            >
              Prefeitura de Saquarema
            </span>

            {secLoading && (
              <div className="w-full max-w-md space-y-2 animate-pulse">
                <div className="h-3 w-full rounded bg-muted" />
                <div className="h-3 w-5/6 rounded bg-muted" />
              </div>
            )}

            {!secLoading && secretaria && (
              <p className="text-muted-foreground text-sm max-w-xl">
                {truncateWords(secretaria.texto, 10)}
              </p>
            )}

            {!secLoading && !secretaria && (
              <p className="text-muted-foreground text-sm">
                Conheça os projetos, ações e iniciativas da Secretaria Municipal
                de Esporte, Lazer e Turismo de Saquarema.
              </p>
            )}

            <div
              className="mt-4 flex items-center font-medium text-sm"
              style={{ color: "#F47920" }}
            >
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
