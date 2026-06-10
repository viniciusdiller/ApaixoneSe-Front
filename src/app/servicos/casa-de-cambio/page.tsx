"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { casaDeCambioApi } from "@/lib/api";
import type { CasaDeCambio } from "@/lib/api";
import { Banknote, ArrowLeft, Phone, MapPin, Instagram, Globe } from "lucide-react";
import { safeMediaUrl } from "@/lib/safeMediaUrl";

export default function CasaDeCambioPage() {
  const [items, setItems] = useState<CasaDeCambio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    casaDeCambioApi
      .getAll()
      .then((data) => setItems(data.filter((i) => i.status === "APROVADO")))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center py-20 px-4 text-center bg-primary/5">
        <div className="absolute left-4 top-6">
          <Link
            href="/servicos"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Serviços
          </Link>
        </div>
        <div className="p-4 rounded-full bg-primary/10 text-primary mb-4">
          <Banknote size={36} />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary mb-4">
          Casas de Câmbio
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Troque sua moeda com segurança em casas de câmbio credenciadas em Saquarema.
        </p>
      </section>

      {/* Lista */}
      <section className="container mx-auto max-w-5xl px-4 py-16">
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border bg-card p-6 animate-pulse space-y-3">
                <div className="h-12 w-12 rounded-lg bg-muted" />
                <div className="h-4 w-2/3 rounded bg-muted" />
                <div className="h-3 w-full rounded bg-muted" />
              </div>
            ))}
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="flex flex-col items-center py-24 text-center text-muted-foreground gap-3">
            <Banknote size={40} className="opacity-30" />
            <p className="text-lg font-medium">Nenhuma casa de câmbio cadastrada ainda.</p>
            <p className="text-sm">Volte em breve para novas opções.</p>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {items.map((item) => {
              const logo = safeMediaUrl(item.logoUrl);
              const foto = safeMediaUrl(item.fotoUrl);
              return (
                <div
                  key={item.id}
                  className="group flex flex-col rounded-2xl border bg-card shadow-sm hover:shadow-md hover:border-primary/50 transition-all overflow-hidden"
                >
                  {foto && (
                    <div className="relative h-36 w-full overflow-hidden bg-muted">
                      <Image
                        src={foto}
                        alt={item.nome}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <div className="p-6 flex flex-col gap-3 flex-1">
                    <div className="flex items-center gap-3">
                      {logo ? (
                        <Image
                          src={logo}
                          alt={item.nome}
                          width={44}
                          height={44}
                          className="rounded-lg object-cover border border-border"
                        />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Banknote size={22} />
                        </div>
                      )}
                      <h2 className="font-bold text-foreground text-lg leading-tight">{item.nome}</h2>
                    </div>

                    {item.moedas && (
                      <p className="text-xs text-muted-foreground bg-muted/50 rounded-full px-3 py-1 self-start">
                        💱 {item.moedas}
                      </p>
                    )}

                    {item.descricao && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.descricao}</p>
                    )}

                    <div className="mt-auto flex flex-col gap-1.5 pt-2 border-t border-border">
                      {item.endereco && (
                        <span className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin size={13} /> {item.endereco}
                        </span>
                      )}
                      {item.telefone && (
                        <a
                          href={`tel:${item.telefone}`}
                          className="flex items-center gap-2 text-xs text-primary hover:underline"
                        >
                          <Phone size={13} /> {item.telefone}
                        </a>
                      )}
                      {item.instagram && (
                        <a
                          href={`https://instagram.com/${item.instagram.replace("@", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Instagram size={13} /> {item.instagram}
                        </a>
                      )}
                      {item.site && (
                        <a
                          href={item.site.startsWith("http") ? item.site : `https://${item.site}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Globe size={13} /> {item.site}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
