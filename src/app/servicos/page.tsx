"use client";

import { Map, Compass, Info, ArrowRight } from "lucide-react";

export default function ServicosPage() {
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
          <div className="group relative flex flex-col items-center p-8 rounded-2xl border bg-card shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer text-center">
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

          <div className="group relative flex flex-col items-center p-8 rounded-2xl border bg-card shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer text-center">
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

          <div className="relative flex flex-col items-center p-8 rounded-2xl border border-dashed border-border bg-secondary/20 text-center cursor-default">
            <div className="p-4 rounded-full bg-secondary text-secondary-foreground mb-4">
              <Info size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-foreground">CAT</h2>
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-4">
              Ponto de Informação
            </span>
            <p className="text-muted-foreground text-sm">
              Centro de Atendimento ao Turista. Venha nos visitar
              presencialmente para mapas, dicas e suporte local gratuito.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
