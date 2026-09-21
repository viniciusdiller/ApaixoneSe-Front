import { useCallback, useRef, useState } from "react";
import { atividadesApi } from "@/lib/api/atividades";
import { eventosApi } from "@/lib/api/eventos";
import { gastronomiaApi } from "@/lib/api/gastronomia";
import { hospedagemApi } from "@/lib/api/hospedagem";
import { servicoTuristaApi } from "@/lib/api/servico-turista";

export type Categoria =
  | "gastronomia"
  | "hospedagem"
  | "evento"
  | "atividade"
  | "servico";

export interface Opcao {
  id: string;
  label: string;
  sublabel?: string;
  /** Só eventos: dias (YYYY-MM-DD) em que ocorrem */
  inicio?: string;
  fim?: string;
}

export const CATEGORIA_LABEL: Record<Categoria, string> = {
  gastronomia: "Restaurante",
  hospedagem: "Hospedagem",
  evento: "Evento",
  atividade: "Atividade",
  servico: "Serviço",
};

const carregadores: Record<Categoria, () => Promise<Opcao[]>> = {
  gastronomia: async () =>
    (await gastronomiaApi.getAll())
      .filter((g) => g.status === "APROVADO")
      .map((g) => ({
        id: g.id,
        label: g.nome,
        sublabel: g.especialidade ?? g.endereco,
      })),
  hospedagem: async () =>
    (await hospedagemApi.getAll())
      .filter((h) => h.status === "APROVADO")
      .map((h) => ({ id: h.id, label: h.nome, sublabel: h.endereco })),
  evento: async () =>
    (await eventosApi.getAll()).map((e) => ({
      id: e.id,
      label: e.titulo,
      sublabel: e.local,
      // Mesma convenção do resto do site: a data é o trecho YYYY-MM-DD da ISO
      inicio: e.data.slice(0, 10),
      fim: (e.dataFim ?? e.data).slice(0, 10),
    })),
  atividade: async () =>
    (await atividadesApi.getAll()).map((a) => ({
      id: a.id,
      label: a.titulo,
      sublabel: a.local,
    })),
  servico: async () =>
    (await servicoTuristaApi.getAll())
      .filter((s) => s.status === "APROVADO")
      .map((s) => ({
        id: s.id,
        label: s.nome,
        sublabel: s.tipo.replace(/_/g, " "),
      })),
};

/** Eventos só aparecem se ocorrem (mesmo que parcialmente) dentro do período do plano */
export function opcoesNoPeriodo(
  categoria: Categoria,
  opcoes: Opcao[],
  dataMin?: string,
  dataMax?: string
): Opcao[] {
  if (categoria !== "evento" || !dataMin || !dataMax) return opcoes;
  return opcoes.filter(
    (o) => o.inicio! <= dataMax && (o.fim ?? o.inicio!) >= dataMin
  );
}

/** Carrega cada categoria uma única vez por uso do hook */
export function useOpcoesLugares() {
  const [opcoes, setOpcoes] = useState<Partial<Record<Categoria, Opcao[]>>>({});
  const pedidas = useRef(new Set<Categoria>());

  const carregar = useCallback((categoria: Categoria) => {
    if (pedidas.current.has(categoria)) return;
    pedidas.current.add(categoria);
    carregadores[categoria]()
      .then((lista) => setOpcoes((p) => ({ ...p, [categoria]: lista })))
      .catch(() => {
        pedidas.current.delete(categoria);
        setOpcoes((p) => ({ ...p, [categoria]: [] }));
      });
  }, []);

  return { opcoes, carregar };
}

/** Extrai a mensagem de negócio do backend; cai no fallback para erros técnicos */
export function mensagemDeErro(e: unknown, fallback: string): string {
  if (!(e instanceof Error)) return fallback;
  try {
    const corpo = JSON.parse(e.message);
    if (corpo.statusCode === 401)
      return "Sua sessão expirou. Entre novamente para continuar.";
    if (typeof corpo.message === "string") return corpo.message;
  } catch {
    /* corpo não era JSON */
  }
  console.error(e);
  return fallback;
}
