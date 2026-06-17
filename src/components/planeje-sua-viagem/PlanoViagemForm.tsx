"use client";

import { useState } from "react";
import { CalendarDays, Loader2 } from "lucide-react";
import { planoViagemApi } from "@/lib/api/plano-viagem";
import type { CreatePlanoViagemDto, PlanoViagem } from "@/lib/api/types";
import { useAuth } from "@/context/AuthContext";

interface Props {
  /** Plano a ser editado. Undefined = criar novo */
  plano?: PlanoViagem;
  onSuccess: (plano: PlanoViagem) => void;
  onCancel: () => void;
}

export function PlanoViagemForm({ plano, onSuccess, onCancel }: Props) {
  const { user } = useAuth();

  const [titulo, setTitulo] = useState(plano?.titulo ?? "");
  const [dataInicio, setDataInicio] = useState(
    plano?.dataInicio?.slice(0, 10) ?? ""
  );
  const [dataFim, setDataFim] = useState(plano?.dataFim?.slice(0, 10) ?? "");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setErro(null);
    setLoading(true);

    try {
      const dto: CreatePlanoViagemDto = {
        titulo,
        dataInicio,
        dataFim,
        usuarioId: user.id,
      };

      const resultado = plano
        ? await planoViagemApi.update(plano.id, dto)
        : await planoViagemApi.create(dto);

      onSuccess(resultado);
    } catch {
      setErro("Não foi possível salvar o plano. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="titulo"
          className="text-sm font-medium text-foreground"
        >
          Nome do plano
        </label>
        <input
          id="titulo"
          type="text"
          required
          maxLength={80}
          placeholder="Ex: Final de semana em Saquarema"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="dataInicio"
            className="flex items-center gap-1.5 text-sm font-medium text-foreground"
          >
            <CalendarDays className="h-4 w-4 text-primary" />
            Data de início
          </label>
          <input
            id="dataInicio"
            type="date"
            required
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="dataFim"
            className="flex items-center gap-1.5 text-sm font-medium text-foreground"
          >
            <CalendarDays className="h-4 w-4 text-primary" />
            Data de fim
          </label>
          <input
            id="dataFim"
            type="date"
            required
            min={dataInicio}
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {erro && (
        <p className="rounded-lg bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          {erro}
        </p>
      )}

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-border px-5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-full bg-accent px-6 py-2 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {plano ? "Salvar alterações" : "Criar plano"}
        </button>
      </div>
    </form>
  );
}
