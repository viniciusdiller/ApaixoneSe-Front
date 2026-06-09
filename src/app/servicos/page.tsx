"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Map, Compass, Info, ArrowRight, Bike, Car, Banknote, FileText } from "lucide-react";
import { catApi } from "@/lib/api";
import type { Cat } from "@/lib/api";

/** Trunca o texto mantendo palavras inteiras, cerca de `max` palavras. */
function truncateWords(text: string, max = 10): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= max) return text;
  return words.slice(0, max).join(" ") + "…";
}

export default function ServicosPage() {
  const router = useRouter();
  const [cat, setCat] = useState<Cat | null>(null);
  const [catLoading, setCatLoading] = useState(true);

  useEffect(() => {
    catApi
      .getAll()
      .then((data) => setCat(data[0] ?? null))
      .catch(() => setCat(null))
      .finally(() => setCatLoading(false));
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
      <section className="relative flex flex-col items-center justify-center py-24 px-4 text-center bg-primary/5">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary mb-4">
          Serviços Turísticos
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Explore nossa cidade com os melhores profissionais. Encontre guias
          apaixonados, agências de confiança ou tire suas dúvidas no CAT.
        </p>
      </section>

      <section className="container mx-auto max-w-5xl px-4 py-16">
        {/* Grid dos serviços */}
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

        {/* CAT — caixa clicável separada, largura total */}
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
      </section>
    </div>
  );
}
