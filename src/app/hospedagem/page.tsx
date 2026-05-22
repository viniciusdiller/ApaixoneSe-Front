"use client";

import { useEffect, useState } from "react";
import { hospedagemApi } from "@/lib/api";
import type { Hospedagem } from "@/lib/api";
import { DataCard } from "@/components/ui/DataCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingGrid } from "@/components/ui/LoadingGrid";

export default function HospedagemPage() {
  const [items, setItems] = useState<Hospedagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    hospedagemApi
      .getAll()
      .then(setItems)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4">
        <header className="mb-10">
          <h1 className="font-display text-4xl font-bold uppercase tracking-widest text-foreground">
            Hospedagem
          </h1>
          <p className="mt-2 text-muted-foreground">
            Conheça as melhores opções de acomodação em Saquarema.
          </p>
        </header>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Erro ao carregar dados: {error}
          </div>
        )}

        {loading ? (
          <LoadingGrid />
        ) : items.length === 0 ? (
          <EmptyState description="Nenhuma hospedagem cadastrada ainda." />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((h) => (
              <DataCard
                key={h.id}
                nome={h.nome}
                descricao={h.descricao}
                imagem={h.imagem}
                badge={h.tipo}
                extras={[
                  ...(h.endereco ? [{ label: "Endereço", value: h.endereco }] : []),
                  ...(h.preco ? [{ label: "A partir de", value: `R$ ${h.preco}` }] : []),
                ]}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
