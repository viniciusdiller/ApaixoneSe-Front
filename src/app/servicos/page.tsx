"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Map, Compass, Info, ArrowRight, FileText, ExternalLink } from "lucide-react";
import { catApi } from "@/lib/api";
import type { Cat } from "@/lib/api";

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Guias de Turismo */}
          <div
            onClick={() => router.push("/servicos/guias")}
            className="group relative flex flex-col items-center p-8 rounded-2xl border bg-card shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer text-center"
          >
            <div className="p-4 rounded-full bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
              <Map size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-foreground">
              Guias de Turismo
            </h2>
            <p className="text-muted-foreground mb-6 text-sm">
              Conheça as histórias e os segredos do nosso destino com guias
              credenciados.
            </p>
            <div className="mt-auto flex items-center text-primary font-medium text-sm">
              Ver profissionais{" "}
              <ArrowRight
                size={16}
                className="ml-2 group-hover:translate-x-1 transition-transform"
              />
            </div>
          </div>

          {/* Agências */}
          <div
            onClick={() => router.push("/servicos/agencias")}
            className="group relative flex flex-col items-center p-8 rounded-2xl border bg-card shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer text-center"
          >
            <div className="p-4 rounded-full bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
              <Compass size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-foreground">
              Agências
            </h2>
            <p className="text-muted-foreground mb-6 text-sm">
              Pacotes completos, passeios de barco e roteiros personalizados
              para você.
            </p>
            <div className="mt-auto flex items-center text-primary font-medium text-sm">
              Ver agências{" "}
              <ArrowRight
                size={16}
                className="ml-2 group-hover:translate-x-1 transition-transform"
              />
            </div>
          </div>

          {/* CAT */}
          <div className="relative flex flex-col items-center p-8 rounded-2xl border border-dashed border-border bg-secondary/20 text-center cursor-default">
            <div className="p-4 rounded-full bg-secondary text-secondary-foreground mb-4">
              <Info size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-foreground">CAT</h2>
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-4">
              Ponto de Informação
            </span>

            {catLoading && (
              <div className="w-full space-y-2 animate-pulse">
                <div className="h-3 w-full rounded bg-muted" />
                <div className="h-3 w-5/6 rounded bg-muted" />
                <div className="h-3 w-4/6 rounded bg-muted" />
              </div>
            )}

            {!catLoading && cat && (
              <>
                <p className="text-muted-foreground text-sm mb-4">
                  {cat.texto}
                </p>
                {cat.arquivoUrl && (
                  <a
                    href={cat.arquivoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary transition-all hover:bg-primary/10 hover:border-primary/50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FileText size={14} />
                    Ver documento
                    <ExternalLink size={12} />
                  </a>
                )}
              </>
            )}

            {!catLoading && !cat && (
              <p className="text-muted-foreground text-sm">
                Centro de Atendimento ao Turista. Venha nos visitar
                presencialmente para mapas, dicas e suporte local gratuito.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
