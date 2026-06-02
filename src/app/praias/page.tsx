"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Filter, MapPin, Waves } from "lucide-react";
import { useMemo, useState } from "react";
import { praias } from "@/lib/Dados-Praia";
import { lagoas } from "@/lib/Dados-Lagoa";
import { LagoaCard } from "@/components/lagoa/LagoaCard";
import { useWaveData } from "@/hooks/API-Marinha";

const FILTER_OPTIONS = [
  { label: "Todas", value: "todas" },
  { label: "Para Surf", value: "surf" },
  { label: "Para Família", value: "família" },
  { label: "Acessível", value: "acessivel" },
  { label: "Bandeira Azul", value: "bandeira azul" },
];
function WaveBadge({ lat, lng }: { lat: number; lng: number }) {
  const { data } = useWaveData({ lat, lng });

  if (!data) return null;

  return (
    <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-primary/90 px-3 py-1 text-xs font-medium text-primary-foreground shadow-sm">
      <Waves className="h-3 w-3" />
      {data.waveHeight.toFixed(1)}m
    </div>
  );
}

export default function PraiasPage() {
  const [activeFilter, setActiveFilter] = useState("todas");

  const filtered = useMemo(
    () =>
      praias.filter((p) => {
        if (activeFilter === "todas") return true;
        if (activeFilter === "acessivel") return p.acessivel;
        return p.filtros.includes(activeFilter);
      }),
    [activeFilter],
  );

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-primary px-4 pb-12 pt-32">
        <div className="container mx-auto text-center">
          <h1 className="font-display text-5xl font-bold uppercase text-primary-foreground md:text-6xl">
            Praias & Lagoas
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
            Descubra as praias que fazem de Saquarema a Capital Nacional do
            Esporte e paz e tranquilidade de nossas lagoas
          </p>
        </div>
      </section>

      <div className="relative z-10 container mx-auto -mt-6 px-4">
        <div className="flex flex-wrap justify-center gap-3">
          {FILTER_OPTIONS.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${activeFilter === f.value ? "bg-primary text-primary-foreground shadow-lg" : "border border-border bg-card text-foreground hover:border-primary"}`}
            >
              {f.value === "todas" ? (
                <Filter className="mr-1 inline h-4 w-4" />
              ) : null}
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <section className="px-4 py-16">
        <div className="container mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((praia, i) => (
            <motion.div
              key={praia.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                href={`/praias/${praia.slug}`}
                className="group block overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-xl"
              >
                <div className="relative h-48 overflow-hidden bg-primary/20">
                  <Image
                    src={praia.imagem}
                    alt={praia.nome}
                    width={20}
                    height={20}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <WaveBadge lat={praia.lat} lng={praia.lng} />
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                    {praia.filtros.map((f) => (
                      <span
                        key={f}
                        className="rounded-md bg-restinga/20 px-2 py-0.5 text-xs font-medium text-restinga backdrop-blur-sm"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display text-xl font-bold uppercase text-foreground transition-colors group-hover:text-primary">
                        {praia.nome}
                      </h3>
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>Saquarema, RJ</span>
                      </div>
                    </div>
                    <ArrowRight className="mt-1 h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {praia.descricao_curta}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
      {/* SESSÃO DAS LAGOAS */}
      <section className="px-4 pb-16 pt-8 bg-muted/20">
        <div className="container mx-auto max-w-6xl mb-10 text-center">
          <h2 className="font-display text-4xl font-bold uppercase text-foreground">
            Lagoas
          </h2>
          <p className="mt-2 text-muted-foreground">
            Águas calmas perfeitas para relaxar e contemplar a natureza
          </p>
        </div>

        <div className="container mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {lagoas.map((lagoa, i) => (
            <motion.div
              key={lagoa.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                href={`/lagoas/${lagoa.slug}`}
                className="group block overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-xl"
              >
                <div className="relative h-48 overflow-hidden bg-primary/20">
                  <Image
                    src={lagoa.imagem}
                    alt={lagoa.nome}
                    width={400}
                    height={300}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  {/* Removido o WaveBadge, pois lagoas não têm ondas para surf */}

                  <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-1.5">
                    {lagoa.filtros.map((f) => (
                      <span
                        key={f}
                        className="rounded-md bg-restinga/20 px-2 py-0.5 text-xs font-medium text-restinga backdrop-blur-sm"
                      >
                        {/* Formatando o texto dos filtros (ex: "passeio_de_barco" vira "passeio de barco") */}
                        {f.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display text-xl font-bold uppercase text-foreground transition-colors group-hover:text-primary">
                        {lagoa.nome}
                      </h3>
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>Saquarema, RJ</span>
                      </div>
                    </div>
                    <ArrowRight className="mt-1 h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {lagoa.descricao_curta}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
