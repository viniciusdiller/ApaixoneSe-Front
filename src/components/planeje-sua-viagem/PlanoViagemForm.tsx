"use client";

import { useState } from "react";
import { CalendarDays, Loader2, Plus, Trash2, Clock } from "lucide-react";
import { planoViagemApi } from "@/lib/api/plano-viagem";
import type { PlanoViagem } from "@/lib/api/types";
import { ItemPlanoForm, type ItemRascunho } from "./ItemPlanoForm";

interface Props {
  /** Plano a ser editado. Undefined = criar novo */
  plano?: PlanoViagem;
  onSuccess: (plano: PlanoViagem) => void;
  onCancel: () => void;
}

const FORM_ID = "plano-viagem-form";

export function PlanoViagemForm({ plano, onSuccess, onCancel }: Props) {
  const [titulo, setTitulo] = useState(plano?.titulo ?? "");
  const [dataInicio, setDataInicio] = useState(
    plano?.dataInicio?.slice(0, 10) ?? "",
  );
  const [dataFim, setDataFim] = useState(plano?.dataFim?.slice(0, 10) ?? "");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Itens só são montados na criação; a edição de itens de um plano existente
  // continua no card do plano.
  const [itens, setItens] = useState<ItemRascunho[]>([]);
  const [adicionando, setAdicionando] = useState(false);

  const periodoDefinido = Boolean(
    dataInicio && dataFim && dataFim >= dataInicio,
  );
  const foraDoPeriodo = itens.filter((i) => {
    const dia = i.dataHoraLocal.slice(0, 10);
    return dia < dataInicio || dia > dataFim;
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (foraDoPeriodo.length > 0) {
      setErro("Há itens fora do período. Ajuste as datas ou remova-os.");
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
            itens: itens.map((i) => i.dto),
          });

      onSuccess(resultado);
    } catch {
      setErro("Não foi possível salvar o plano. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <form
        id={FORM_ID}
        onSubmit={handleSubmit}
        className="flex flex-col gap-5"
      >
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
      </form>

      {/* Fora do <form> de propósito: ItemPlanoForm é um <form> e forms não aninham */}
      {!plano && (
        <section className="flex flex-col gap-3">
          <p className="text-sm font-medium text-foreground">
            Itens do plano{" "}
            <span className="text-muted-foreground">(opcional)</span>
          </p>

          {itens.map((item, idx) => {
            const fora = foraDoPeriodo.includes(item);
            return (
              <div
                key={idx}
                className={`flex items-start gap-3 rounded-xl border bg-background p-3 ${
                  fora ? "border-destructive/50" : "border-border"
                }`}
              >
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-xs font-semibold text-primary">
                    {item.categoria}
                  </span>
                  <p className="truncate text-sm font-semibold text-foreground">
                    {item.nome}
                  </p>
                  {item.detalhe && (
                    <p className="truncate text-xs text-muted-foreground">
                      {item.detalhe}
                    </p>
                  )}
                  <span
                    className={`mt-1 flex items-center gap-1 text-xs ${
                      fora ? "text-destructive" : "text-muted-foreground"
                    }`}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(item.dataHoraLocal).toLocaleString("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                    {fora && " — fora do período"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setItens((prev) => prev.filter((_, i) => i !== idx))
                  }
                  aria-label="Remover item"
                  className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}

          {adicionando ? (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary">
                Adicionar item ao plano
              </p>
              <ItemPlanoForm
                dataMin={dataInicio}
                dataMax={dataFim}
                onAddRascunho={(item) => {
                  setItens((prev) => [...prev, item]);
                  setAdicionando(false);
                }}
                onCancel={() => setAdicionando(false)}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAdicionando(true)}
              disabled={!periodoDefinido}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-border disabled:hover:text-muted-foreground"
            >
              <Plus className="h-4 w-4" />
              {periodoDefinido
                ? "Adicionar item"
                : "Defina as datas para adicionar itens"}
            </button>
          )}
        </section>
      )}

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
          form={FORM_ID}
          disabled={loading || foraDoPeriodo.length > 0}
          className="flex items-center gap-2 rounded-full bg-accent px-6 py-2 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {plano ? "Salvar alterações" : "Criar plano"}
        </button>
      </div>
    </div>
  );
}
