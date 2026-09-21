"use client";

import { useState } from "react";
import { CalendarDays, Info, Loader2, Plus } from "lucide-react";
import { planoViagemApi } from "@/lib/api/plano-viagem";
import type {
  CreateItemPlanoViagemInlineDto,
  PlanoViagem,
} from "@/lib/api/types";
import { DateField } from "./DateField";
import { ItemPlanoRow, type LinhaItem } from "./ItemPlanoRow";
import {
  mensagemDeErro,
  opcoesNoPeriodo,
  useOpcoesLugares,
  type Categoria,
} from "./lugares";

interface Props {
  /** Plano a ser editado. Undefined = criar novo */
  plano?: PlanoViagem;
  onSuccess: (plano: PlanoViagem) => void;
  onCancel: () => void;
}

const campo =
  "rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

const CAMPO_POR_CATEGORIA: Record<
  Categoria,
  keyof CreateItemPlanoViagemInlineDto
> = {
  gastronomia: "gastronomiaId",
  hospedagem: "hospedagemId",
  evento: "eventoId",
  atividade: "atividadeId",
  servico: "servicoTuristaId",
};

let proximaChave = 0;

export function PlanoViagemForm({ plano, onSuccess, onCancel }: Props) {
  const [titulo, setTitulo] = useState(plano?.titulo ?? "");
  const [dataInicio, setDataInicio] = useState(
    plano?.dataInicio?.slice(0, 10) ?? ""
  );
  const [dataFim, setDataFim] = useState(plano?.dataFim?.slice(0, 10) ?? "");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Itens só na criação; itens de um plano existente são geridos no card do plano
  const [linhas, setLinhas] = useState<LinhaItem[]>([]);
  const { opcoes, carregar } = useOpcoesLugares();

  const periodoDefinido = Boolean(
    dataInicio && dataFim && dataFim >= dataInicio
  );

  function opcoesDaLinha(l: LinhaItem) {
    const todas = opcoes[l.categoria];
    return todas && opcoesNoPeriodo(l.categoria, todas, dataInicio, dataFim);
  }

  /** Recalculado a cada render: mudar as datas invalida linhas que ficaram fora */
  function problemaDaLinha(l: LinhaItem): string | null {
    const dia = l.dataHora.split("T")[0];
    if (dia && (dia < dataInicio || dia > dataFim))
      return "Data fora do período do plano.";
    const lista = opcoesDaLinha(l);
    if (l.referenciaId && lista && !lista.some((o) => o.id === l.referenciaId))
      return "Este item não está disponível no período do plano.";
    return null;
  }

  function adicionarLinha() {
    carregar("gastronomia");
    setLinhas((prev) => [
      ...prev,
      {
        key: proximaChave++,
        categoria: "gastronomia",
        referenciaId: "",
        dataHora: "",
        anotacao: "",
      },
    ]);
  }

  function atualizarLinha(key: number, patch: Partial<LinhaItem>) {
    if (patch.categoria) carregar(patch.categoria);
    setLinhas((prev) =>
      prev.map((l) => (l.key === key ? { ...l, ...patch } : l))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (linhas.some((l) => problemaDaLinha(l))) {
      setErro("Há itens fora do período do plano. Ajuste ou remova-os.");
      return;
    }
    setLoading(true);

    try {
      // O backend extrai o usuário do JWT — não enviar usuarioId no body
      const dto = { titulo, dataInicio, dataFim };

      const resultado = plano
        ? await planoViagemApi.update(plano.id, dto)
        : await planoViagemApi.create({
            ...dto,
            itens: linhas.map((l) => ({
              dataHoraAgendada: new Date(l.dataHora).toISOString(),
              anotacao: l.anotacao || undefined,
              [CAMPO_POR_CATEGORIA[l.categoria]]: l.referenciaId,
            })),
          });

      onSuccess(resultado);
    } catch (e) {
      setErro(
        mensagemDeErro(e, "Não foi possível salvar o plano. Tente novamente.")
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="titulo" className="text-sm font-medium text-foreground">
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
          className={`${campo} placeholder:text-muted-foreground`}
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
          <DateField
            id="dataInicio"
            required
            value={dataInicio}
            onChange={(v) => {
              setDataInicio(v);
              if (dataFim && dataFim < v) setDataFim("");
            }}
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
          <DateField
            id="dataFim"
            required
            min={dataInicio || undefined}
            value={dataFim}
            onChange={setDataFim}
          />
        </div>
      </div>

      {!plano && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-foreground">
            O que você vai fazer?{" "}
            <span className="text-muted-foreground">(opcional)</span>
          </p>

          {linhas.length > 0 && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-400/30 bg-amber-50 px-4 py-3 dark:bg-amber-900/20">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">
                <strong>Atenção:</strong> Este plano é apenas um organizador
                pessoal. Adicionar um lugar aqui <strong>não faz reserva</strong>{" "}
                nem garante disponibilidade. Contate o estabelecimento
                diretamente.
              </p>
            </div>
          )}

          {linhas.map((l) => (
            <ItemPlanoRow
              key={l.key}
              linha={l}
              opcoes={opcoesDaLinha(l)}
              dataMin={dataInicio}
              dataMax={dataFim}
              problema={problemaDaLinha(l)}
              onChange={(patch) => atualizarLinha(l.key, patch)}
              onRemove={() =>
                setLinhas((prev) => prev.filter((x) => x.key !== l.key))
              }
            />
          ))}

          <button
            type="button"
            onClick={adicionarLinha}
            disabled={!periodoDefinido}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-border disabled:hover:text-muted-foreground"
          >
            <Plus className="h-4 w-4" />
            {periodoDefinido
              ? "Adicionar item"
              : "Defina as datas para adicionar itens"}
          </button>

        </div>
      )}

      {erro && (
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 px-4 py-2.5 text-sm text-destructive"
        >
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
