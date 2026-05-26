"use client";

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { HospedagemCard } from "@/components/hospedagens/HospedagemCard";
import { hospedagemApi } from "@/lib/api";
import type { Hospedagem } from "@/lib/api";

function CardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-border bg-card">
      <div className="h-40 bg-muted" />
      <div className="flex flex-col gap-3 p-5">
        <div className="h-5 w-2/3 rounded bg-muted" />
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-5/6 rounded bg-muted" />
        <div className="h-3 w-4/6 rounded bg-muted" />
        <div className="mt-2 flex gap-2">
          <div className="h-7 w-28 rounded-full bg-muted" />
          <div className="h-7 w-24 rounded-full bg-muted" />
        </div>
      </div>
    </div>
  );
}

export function HospedagensClient() {
  const [hospedagens, setHospedagens] = useState<Hospedagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    hospedagemApi
      .getAll()
      .then((data) =>
        // Filtra apenas as APROVADAS — não exibe PENDENTE nem REJEITADO
        setHospedagens(data.filter((h) => h.status === "APROVADO"))
      )
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* Contador */}
      {!loading && !error && hospedagens.length > 0 && (
        <p className="mb-8 text-sm text-muted-foreground">
          {hospedagens.length}{" "}
          {hospedagens.length === 1 ? "hospedagem encontrada" : "hospedagens encontradas"}
        </p>
      )}

      {/* Erro */}
      {error && (
        <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
          <AlertCircle className="mb-4 h-10 w-10 text-destructive/60" />
          <p className="text-base font-medium">Não foi possível carregar as hospedagens.</p>
          <p className="mt-1 text-sm">Verifique sua conexão e tente novamente.</p>
        </div>
      )}

      {/* Skeletons */}
      {loading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && hospedagens.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
          <span className="mb-3 text-5xl">🏨</span>
          <p className="text-base font-medium">Nenhuma hospedagem disponível no momento.</p>
          <p className="mt-1 text-sm">Em breve novos parceiros serão adicionados.</p>
        </div>
      )}

      {/* Grid real */}
      {!loading && !error && hospedagens.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {hospedagens.map((h, i) => (
            <HospedagemCard key={h.id} hospedagem={h} index={i} />
          ))}
        </div>
      )}
    </>
  );
}
