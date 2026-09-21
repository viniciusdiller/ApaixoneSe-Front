"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  Info,
  Utensils,
  BedDouble,
  CalendarDays,
  Bike,
  Compass,
} from "lucide-react";
import { DateTimeField } from "./DateField";
import { itemPlanoViagemApi } from "@/lib/api/plano-viagem";
import type { ItemPlanoViagem } from "@/lib/api/types";
import {
  CATEGORIA_LABEL,
  mensagemDeErro,
  opcoesNoPeriodo,
  useOpcoesLugares,
  type Categoria,
} from "./lugares";

const CATEGORIAS: { key: Categoria; label: string; icon: React.ReactNode }[] = [
  { key: "gastronomia", label: CATEGORIA_LABEL.gastronomia, icon: <Utensils className="h-4 w-4" /> },
  { key: "hospedagem", label: CATEGORIA_LABEL.hospedagem, icon: <BedDouble className="h-4 w-4" /> },
  { key: "evento", label: CATEGORIA_LABEL.evento, icon: <CalendarDays className="h-4 w-4" /> },
  { key: "atividade", label: CATEGORIA_LABEL.atividade, icon: <Bike className="h-4 w-4" /> },
  { key: "servico", label: CATEGORIA_LABEL.servico, icon: <Compass className="h-4 w-4" /> },
];

interface Props {
  planoViagemId: string;
  /** Período do plano (YYYY-MM-DD): restringe a data do item e filtra eventos */
  dataMin?: string;
  dataMax?: string;
  onSuccess: (item: ItemPlanoViagem) => void;
  onCancel: () => void;
}

export function ItemPlanoForm({
  planoViagemId,
  dataMin,
  dataMax,
  onSuccess,
  onCancel,
}: Props) {
  const [categoria, setCategoria] = useState<Categoria>("gastronomia");
  const [dataHora, setDataHora] = useState("");
  const [anotacao, setAnotacao] = useState("");
  const [referenciaId, setReferenciaId] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const { opcoes: todas, carregar } = useOpcoesLugares();
  const carregadas = todas[categoria];
  const loadingOpcoes = carregadas === undefined;
  const opcoes = opcoesNoPeriodo(categoria, carregadas ?? [], dataMin, dataMax);

  useEffect(() => {
    carregar(categoria);
    setReferenciaId("");
  }, [categoria, carregar]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!referenciaId) {
      setErro("Selecione um item da lista.");
      return;
    }
    const dia = dataHora.split("T")[0];
    if ((dataMin && dia < dataMin) || (dataMax && dia > dataMax)) {
      setErro("A data do item deve estar dentro do período do plano.");
      return;
    }
    setErro(null);
    setLoading(true);

    try {
      const item = await itemPlanoViagemApi.create({
        planoViagemId,
        dataHoraAgendada: new Date(dataHora).toISOString(),
        anotacao: anotacao || undefined,
        ...(categoria === "gastronomia" && { gastronomiaId: referenciaId }),
        ...(categoria === "hospedagem" && { hospedagemId: referenciaId }),
        ...(categoria === "evento" && { eventoId: referenciaId }),
        ...(categoria === "atividade" && { atividadeId: referenciaId }),
        ...(categoria === "servico" && { servicoTuristaId: referenciaId }),
      });
      onSuccess(item);
    } catch (e) {
      setErro(mensagemDeErro(e, "Não foi possível adicionar o item. Tente novamente."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Aviso importante */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-400/30 bg-amber-50 px-4 py-3 dark:bg-amber-900/20">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">
          <strong>Atenção:</strong> Este plano é apenas um organizador pessoal.
          Adicionar um lugar aqui <strong>não faz reserva</strong> nem garante
          disponibilidade. Contate o estabelecimento diretamente.
        </p>
      </div>

      {/* Tabs de categoria */}
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Categoria</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIAS.map(({ key, label, icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setCategoria(key)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                categoria === key
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Dropdown com nomes */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="referencia" className="text-sm font-medium text-foreground">
          {CATEGORIAS.find((c) => c.key === categoria)?.label}
        </label>
        {loadingOpcoes ? (
          <div className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Carregando...</span>
          </div>
        ) : (
          <select
            id="referencia"
            required
            value={referenciaId}
            onChange={(e) => setReferenciaId(e.target.value)}
            className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          >
            <option value="" disabled>
              {opcoes.length === 0
                ? categoria === "evento"
                  ? "Nenhum evento neste período"
                  : "Nenhum item cadastrado"
                : `Selecione um(a) ${CATEGORIAS.find((c) => c.key === categoria)?.label?.toLowerCase()}...`}
            </option>
            {opcoes.map((op) => (
              <option key={op.id} value={op.id}>
                {op.label}{op.sublabel ? ` — ${op.sublabel}` : ""}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Data e hora */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="dataHora" className="text-sm font-medium text-foreground">
          Data e hora (planejada)
        </label>
        <DateTimeField
          id="dataHora"
          required
          min={dataMin}
          max={dataMax}
          value={dataHora}
          onChange={setDataHora}
        />
      </div>

      {/* Anotação */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="anotacao" className="text-sm font-medium text-foreground">
          Anotação <span className="text-muted-foreground">(opcional)</span>
        </label>
        <textarea
          id="anotacao"
          rows={2}
          maxLength={300}
          placeholder="Ex: Pedir mesa com vista pro mar, levar protetor solar..."
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
          disabled={loading || loadingOpcoes || opcoes.length === 0}
          className="flex items-center gap-2 rounded-full bg-accent px-6 py-2 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Adicionar ao plano
        </button>
      </div>
    </form>
  );
}
