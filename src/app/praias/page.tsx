"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Filter,
  MapPin,
  Waves,
  AlertCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { pontosAguaApi } from "@/lib/api";
import type { PontoAgua } from "@/lib/api";
import { LagoaCard } from "@/components/lagoa/LagoaCard";
import { useWaveData } from "@/hooks/API-Marinha";
import { safeMediaUrl } from "@/lib/safeMediaUrl";

const FILTER_OPTIONS = [
  { label: "Todas", value: "todas" },
  { label: "Para Surf", value: "Surf" },
  { label: "Para Família", value: "Família" },
  { label: "Bandeira Azul", value: "Bandeira Azul" },
];
function WaveBadge({ lat, lng }: { lat?: number | null; lng?: number | null }) {
  const { data } = useWaveData({
    lat: lat ?? undefined,
    lng: lng ?? undefined,
  });
  if (!data) return null;
  return (
    <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-primary/90 px-3 py-1 text-xs font-medium text-primary-foreground shadow-sm">
      <Waves className="h-3 w-3" />
      {data.waveHeight.toFixed(1)}m
    </div>
  );
}

export default function PraiasPage() {
  const [pontos, setPontos] = useState<PontoAgua[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);
  const [activeFilter, setActiveFilter] = useState("todas");

  useEffect(() => {
    pontosAguaApi
      .getAll()
      .then(setPontos)
      .catch(() => setErro(true))
      .finally(() => setLoading(false));
  }, []);

  const praias = useMemo(
    () => pontos.filter((p) => p.tipo === "PRAIA"),
    [pontos],
  );
  const lagoas = useMemo(
    () => pontos.filter((p) => p.tipo === "LAGOA"),
    [pontos],
  );

  const filtered = useMemo(
    () =>
      praias.filter((p) => {
        if (activeFilter === "todas") return true;
        if (activeFilter === "acessivel") return p.acessivel;
        return (p.filtros ?? []).includes(activeFilter);
      }),
    [praias, activeFilter],
  );

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-primary px-4 pb-12 pt-32">
        <div className="container mx-auto">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2 text-sm text-primary-foreground/80 transition-colors hover:bg-primary-foreground/20 hover:text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para página inicial
          </Link>
          <h1 className="font-display text-5xl font-bold uppercase text-primary-foreground md:text-6xl">
            Praias & Lagoas
          </h1>
          <p className="mt-4 max-w-xl text-primary-foreground/80">
            Descubra as praias que fazem de Saquarema a Capital Nacional do
            Esporte e paz e tranquilidade de nossas lagoas
          </p>
        </div>
      </section>

      {!loading && !erro && (
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
      )}

      <section className="px-4 py-16">
        <div className="container mx-auto max-w-6xl">
          {loading ? (
            <p className="text-center text-muted-foreground">
              Carregando praias...
            </p>
          ) : erro ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm">
              <AlertCircle className="mx-auto mb-4 h-10 w-10 text-destructive/60" />
              <p className="font-display text-2xl font-bold text-foreground">
                Ops! Tivemos um imprevisto.
              </p>
              <p className="mt-2 text-muted-foreground">
                Não conseguimos carregar os dados. Tente novamente mais tarde.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((praia, i) => {
                const src = safeMediaUrl(praia.imagemUrl);
                return (
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
                        {src && (
                          <Image
                            src={src}
                            alt={praia.nome}
                            fill
                            className="object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <WaveBadge lat={praia.latitude} lng={praia.longitude} />
                        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                          {(praia.filtros ?? []).map((f) => (
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
                          {praia.descricaoCurta}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
              {filtered.length === 0 && (
                <p className="col-span-full text-center text-muted-foreground">
                  Nenhuma praia encontrada para este filtro.
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {!loading && !erro && lagoas.length > 0 && (
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
                <LagoaCard lagoa={lagoa} />
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
