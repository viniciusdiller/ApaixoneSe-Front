"use client";

import { useId } from "react";
import {
  Bike,
  BedDouble,
  CalendarDays,
  Compass,
  Loader2,
  Trash2,
  Utensils,
} from "lucide-react";
import { DateTimeField } from "./DateField";
import { CATEGORIA_LABEL, type Categoria, type Opcao } from "./lugares";

export interface LinhaItem {
  key: number;
  categoria: Categoria;
  referenciaId: string;
  /** "YYYY-MM-DDTHH:mm" */
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

export const ICONE_CATEGORIA: Record<Categoria, React.ReactNode> = {
  gastronomia: <Utensils className="h-4 w-4" />,
  hospedagem: <BedDouble className="h-4 w-4" />,
  evento: <CalendarDays className="h-4 w-4" />,
  atividade: <Bike className="h-4 w-4" />,
  servico: <Compass className="h-4 w-4" />,
};

const campo =
  "rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50";

/** Um item do plano, com o mesmo visual do formulário de item, mas como parte do <form> do plano */
export function ItemPlanoRow({
  linha,
  opcoes,
  dataMin,
  dataMax,
  problema,
  onChange,
  onRemove,
}: Props) {
  const uid = useId();
  const label = CATEGORIA_LABEL[linha.categoria];
  const nenhuma = opcoes?.length === 0;

  return (
    <div
      className={`flex flex-col gap-5 rounded-xl border p-4 ${
        problema
          ? "border-destructive/50 bg-destructive/5"
          : "border-primary/30 bg-primary/5"
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Item do plano
        </p>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remover item"
          className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Remover
        </button>
      </div>

      {/* Tabs de categoria */}
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Categoria</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(CATEGORIA_LABEL) as Categoria[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => onChange({ categoria: key, referenciaId: "" })}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                linha.categoria === key
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {ICONE_CATEGORIA[key]}
              {CATEGORIA_LABEL[key]}
            </button>
          ))}
        </div>
      </div>

      {/* Dropdown com nomes */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={`${uid}-ref`}
          className="text-sm font-medium text-foreground"
        >
          {label}
        </label>
        {opcoes === undefined ? (
          <div className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Carregando...</span>
          </div>
        ) : (
          <select
            id={`${uid}-ref`}
            required
            disabled={nenhuma}
            value={linha.referenciaId}
            onChange={(e) => onChange({ referenciaId: e.target.value })}
            className={campo}
          >
            <option value="" disabled>
              {nenhuma
                ? linha.categoria === "evento"
                  ? "Nenhum evento neste período"
                  : "Nenhum item cadastrado"
                : `Selecione um(a) ${label.toLowerCase()}...`}
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

      {/* Data e hora */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={`${uid}-data`}
          className="text-sm font-medium text-foreground"
        >
          Data e hora (planejada)
        </label>
        <DateTimeField
          id={`${uid}-data`}
          required
          min={dataMin}
          max={dataMax}
          value={linha.dataHora}
          onChange={(dataHora) => onChange({ dataHora })}
        />
      </div>

      {/* Anotação */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={`${uid}-nota`}
          className="text-sm font-medium text-foreground"
        >
          Anotação <span className="text-muted-foreground">(opcional)</span>
        </label>
        <textarea
          id={`${uid}-nota`}
          rows={2}
          maxLength={300}
          placeholder="Ex: Pedir mesa com vista pro mar, levar protetor solar..."
          value={linha.anotacao}
          onChange={(e) => onChange({ anotacao: e.target.value })}
          className={`resize-none ${campo}`}
        />
      </div>

      {problema && <p className="text-xs text-destructive">{problema}</p>}
    </div>
  );
}
