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
import { itemPlanoViagemApi } from "@/lib/api/plano-viagem";
import { atividadesApi } from "@/lib/api/atividades";
import { eventosApi } from "@/lib/api/eventos";
import { gastronomiaApi } from "@/lib/api/gastronomia";
import { hospedagemApi } from "@/lib/api/hospedagem";
import { servicoTuristaApi } from "@/lib/api/servico-turista";
import type {
  ItemPlanoViagem,
  Atividade,
  Evento,
  Gastronomia,
  Hospedagem,
  ServicoTurista,
} from "@/lib/api/types";

type Categoria =
  | "gastronomia"
  | "hospedagem"
  | "evento"
  | "atividade"
  | "servico";

const CATEGORIAS: { key: Categoria; label: string; icon: React.ReactNode }[] = [
  { key: "gastronomia", label: "Restaurante", icon: <Utensils className="h-4 w-4" /> },
  { key: "hospedagem", label: "Hospedagem", icon: <BedDouble className="h-4 w-4" /> },
  { key: "evento", label: "Evento", icon: <CalendarDays className="h-4 w-4" /> },
  { key: "atividade", label: "Atividade", icon: <Bike className="h-4 w-4" /> },
  { key: "servico", label: "Serviço", icon: <Compass className="h-4 w-4" /> },
];

interface Props {
  planoViagemId: string;
  onSuccess: (item: ItemPlanoViagem) => void;
  onCancel: () => void;
}

export function ItemPlanoForm({ planoViagemId, onSuccess, onCancel }: Props) {
  const [categoria, setCategoria] = useState<Categoria>("gastronomia");
  const [dataHora, setDataHora] = useState("");
  const [anotacao, setAnotacao] = useState("");
  const [referenciaId, setReferenciaId] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Opções de cada categoria
  const [gastronomias, setGastronomias] = useState<Gastronomia[]>([]);
  const [hospedagens, setHospedagens] = useState<Hospedagem[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [servicos, setServicos] = useState<ServicoTurista[]>([]);
  const [loadingOpcoes, setLoadingOpcoes] = useState(false);

  // Carrega a lista da categoria selecionada
  useEffect(() => {
    setReferenciaId("");
    setLoadingOpcoes(true);

    const fetches: Record<Categoria, () => Promise<void>> = {
      gastronomia: async () => {
        const data = await gastronomiaApi.getAll();
        setGastronomias(data.filter((g) => g.status === "APROVADO"));
      },
      hospedagem: async () => {
        const data = await hospedagemApi.getAll();
        setHospedagens(data.filter((h) => h.status === "APROVADO"));
      },
      evento: async () => {
        const data = await eventosApi.getAll();
        setEventos(data);
      },
      atividade: async () => {
        const data = await atividadesApi.getAll();
        setAtividades(data);
      },
      servico: async () => {
        const data = await servicoTuristaApi.getAll();
        setServicos(data.filter((s) => s.status === "APROVADO"));
      },
    };

    fetches[categoria]()
      .catch(() => {})
      .finally(() => setLoadingOpcoes(false));
  }, [categoria]);

  function getOpcoes(): { id: string; label: string; sublabel?: string }[] {
    switch (categoria) {
      case "gastronomia":
        return gastronomias.map((g) => ({
          id: g.id,
          label: g.nome,
          sublabel: g.especialidade ?? g.endereco,
        }));
      case "hospedagem":
        return hospedagens.map((h) => ({
          id: h.id,
          label: h.nome,
          sublabel: h.endereco,
        }));
      case "evento":
        return eventos.map((e) => ({
          id: e.id,
          label: e.titulo,
          sublabel: e.local,
        }));
      case "atividade":
        return atividades.map((a) => ({
          id: a.id,
          label: a.titulo,
          sublabel: a.local,
        }));
      case "servico":
        return servicos.map((s) => ({
          id: s.id,
          label: s.nome,
          sublabel: s.tipo.replace(/_/g, " "),
        }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!referenciaId) {
      setErro("Selecione um item da lista.");
      return;
    }
    setErro(null);
    setLoading(true);

    try {
      const dto = {
        planoViagemId,
        dataHoraAgendada: new Date(dataHora).toISOString(),
        anotacao: anotacao || undefined,
        ...(categoria === "gastronomia" && { gastronomiaId: referenciaId }),
        ...(categoria === "hospedagem" && { hospedagemId: referenciaId }),
        ...(categoria === "evento" && { eventoId: referenciaId }),
        ...(categoria === "atividade" && { atividadeId: referenciaId }),
        ...(categoria === "servico" && { servicoTuristaId: referenciaId }),
      };
      const item = await itemPlanoViagemApi.create(dto);
      onSuccess(item);
    } catch {
      setErro("Não foi possível adicionar o item. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const opcoes = getOpcoes();

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
                ? "Nenhum item cadastrado"
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
