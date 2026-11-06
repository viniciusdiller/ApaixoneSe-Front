"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { bandeiraAzulApi } from "@/lib/api";
import type { BandeiraAzul } from "@/lib/api";
import { safeMediaUrl } from "@/lib/safeMediaUrl";
import { BlocosBandeiraAzul } from "@/components/bandeira-azul/BlocosBandeiraAzul";

export default function BandeiraAzulPage() {
  const [pagina, setPagina] = useState<BandeiraAzul | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    bandeiraAzulApi
      .get()
      .then(setPagina)
      .catch(() => setErro(true))
      .finally(() => setLoading(false));
  }, []);

  const imagem = pagina?.bannerImagens?.[0] ? safeMediaUrl(pagina.bannerImagens[0]) : "";

  return (
    <div className="min-h-screen bg-background">
      <section
        className="relative bg-sky-800 bg-cover bg-center px-4 pb-12 pt-32"
        style={imagem ? { backgroundImage: `url('${imagem}')` } : undefined}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="container relative z-10 mx-auto">
          <Link
            href="/praias"
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2 text-sm text-primary-foreground/80 transition-colors hover:bg-primary-foreground/20 hover:text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Praias & Lagoas
          </Link>
          <h1 className="font-display text-5xl font-bold uppercase text-primary-foreground md:text-6xl">
            {pagina?.titulo ?? "Bandeira Azul"}
          </h1>
          {pagina?.subtitulo && (
            <p className="mt-4 max-w-xl text-primary-foreground/80">{pagina.subtitulo}</p>
          )}
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="container mx-auto max-w-3xl">
          {loading ? (
            <p className="text-center text-muted-foreground">Carregando...</p>
          ) : erro || !pagina ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm">
              <AlertCircle className="mx-auto mb-4 h-10 w-10 text-destructive/60" />
              <p className="font-display text-2xl font-bold text-foreground">
                {erro ? "Ops! Tivemos um imprevisto." : "Conteúdo em breve."}
              </p>
              <p className="mt-2 text-muted-foreground">
                {erro
                  ? "Não conseguimos carregar os dados. Tente novamente mais tarde."
                  : "As informações sobre a Bandeira Azul ainda não foram publicadas."}
              </p>
            </div>
          ) : (
            <BlocosBandeiraAzul blocos={pagina.blocos} />
          )}
        </div>
      </section>
    </div>
  );
}
