"use client";

import { Loader2, Trash2 } from "lucide-react";
import {
  CATEGORIA_LABEL,
  type Categoria,
  type Opcao,
} from "./lugares";

export interface LinhaItem {
  key: number;
  categoria: Categoria;
  referenciaId: string;
  dataHora: string;
  anotacao: string;
}

interface Props {
  linha: LinhaItem;
  /** undefined enquanto a categoria carrega; já filtradas pelo período */
  opcoes: Opcao[] | undefined;
  dataMin: string;
  dataMax: string;
  problema: string | null;
  onChange: (patch: Partial<LinhaItem>) => void;
  onRemove: () => void;
}

const campo =
  "rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

/** Linha editável de item: campos do próprio <form> do plano, sem etapa intermediária */
export function ItemPlanoRow({
  linha,
  opcoes,
  dataMin,
  dataMax,
  problema,
  onChange,
  onRemove,
}: Props) {
  const nenhuma = opcoes?.length === 0;

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border bg-background p-3.5 ${
        problema ? "border-destructive/50" : "border-border"
      }`}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[10rem_1fr]">
        <select
          aria-label="Categoria"
          value={linha.categoria}
          onChange={(e) =>
            onChange({ categoria: e.target.value as Categoria, referenciaId: "" })
          }
          className={campo}
        >
          {(Object.keys(CATEGORIA_LABEL) as Categoria[]).map((c) => (
            <option key={c} value={c}>
              {CATEGORIA_LABEL[c]}
            </option>
          ))}
        </select>

        {opcoes === undefined ? (
          <div className={`${campo} flex items-center gap-2 text-muted-foreground`}>
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando...
          </div>
        ) : (
          <select
            aria-label={CATEGORIA_LABEL[linha.categoria]}
            required
            disabled={nenhuma}
            value={linha.referenciaId}
            onChange={(e) => onChange({ referenciaId: e.target.value })}
            className={`${campo} disabled:opacity-60`}
          >
            <option value="" disabled>
              {nenhuma
                ? linha.categoria === "evento"
                  ? "Nenhum evento neste período"
                  : "Nenhum item cadastrado"
                : "Selecione..."}
            </option>
            {opcoes.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
                {o.sublabel ? ` — ${o.sublabel}` : ""}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[13rem_1fr_auto]">
        <input
          aria-label="Data e hora"
          type="datetime-local"
          required
          min={`${dataMin}T00:00`}
          max={`${dataMax}T23:59`}
          value={linha.dataHora}
          onChange={(e) => onChange({ dataHora: e.target.value })}
          className={campo}
        />
        <input
          aria-label="Anotação"
          type="text"
          maxLength={300}
          placeholder="Anotação (opcional)"
          value={linha.anotacao}
          onChange={(e) => onChange({ anotacao: e.target.value })}
          className={campo}
        />
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remover item"
          className="flex items-center justify-center rounded-lg px-2.5 py-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {problema && <p className="text-xs text-destructive">{problema}</p>}
    </div>
  );
}
