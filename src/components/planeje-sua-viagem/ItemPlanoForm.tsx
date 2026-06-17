"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { itemPlanoViagemApi } from "@/lib/api/plano-viagem";
import type { CreateItemPlanoViagemDto, ItemPlanoViagem } from "@/lib/api/types";

type TipoItem = "gastronomia" | "hospedagem" | "evento" | "atividade" | "servicoTurista";

const TIPOS: { value: TipoItem; label: string }[] = [
  { value: "gastronomia", label: "Restaurante / Gastronomia" },
  { value: "hospedagem", label: "Hospedagem" },
  { value: "evento", label: "Evento" },
  { value: "atividade", label: "Atividade" },
  { value: "servicoTurista", label: "Serviço Turístico" },
];

interface Props {
  planoId: string;
  onSuccess: (item: ItemPlanoViagem) => void;
  onCancel: () => void;
}

export function ItemPlanoForm({ planoId, onSuccess, onCancel }: Props) {
  const [tipo, setTipo] = useState<TipoItem>("gastronomia");
  const [referenciaId, setReferenciaId] = useState("");
  const [dataHora, setDataHora] = useState("");
  const [anotacao, setAnotacao] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!referenciaId.trim()) {
      setErro("Informe o ID do item que deseja adicionar.");
      return;
    }
    setErro(null);
    setLoading(true);

    try {
      const dto: CreateItemPlanoViagemDto = {
        planoViagemId: planoId,
        dataHoraAgendada: new Date(dataHora).toISOString(),
        anotacao: anotacao || undefined,
        [`${tipo}Id`]: referenciaId,
      } as CreateItemPlanoViagemDto;

      const novoItem = await itemPlanoViagemApi.create(dto);
      onSuccess(novoItem);
    } catch {
      setErro("Não foi possível adicionar o item. Verifique o ID e tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Tipo de item */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="tipo" className="text-sm font-medium text-foreground">
          Tipo de item
        </label>
        <select
          id="tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value as TipoItem)}
          className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {TIPOS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* ID de referência */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="referenciaId"
          className="text-sm font-medium text-foreground"
        >
          ID do estabelecimento / evento
        </label>
        <input
          id="referenciaId"
          type="text"
          required
          placeholder="Cole aqui o ID"
          value={referenciaId}
          onChange={(e) => setReferenciaId(e.target.value)}
          className="rounded-xl border border-border bg-background px-4 py-2.5 font-mono text-sm text-foreground placeholder:font-sans placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Data e hora */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="dataHora"
          className="text-sm font-medium text-foreground"
        >
          Data e hora agendada
        </label>
        <input
          id="dataHora"
          type="datetime-local"
          required
          value={dataHora}
          onChange={(e) => setDataHora(e.target.value)}
          className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Anotação */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="anotacao"
          className="text-sm font-medium text-foreground"
        >
          Anotação{" "}
          <span className="text-muted-foreground">(opcional)</span>
        </label>
        <textarea
          id="anotacao"
          rows={3}
          maxLength={300}
          placeholder="Lembrete, dica, observação..."
          value={anotacao}
          onChange={(e) => setAnotacao(e.target.value)}
          className="resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
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
          Adicionar item
        </button>
      </div>
    </form>
  );
}
