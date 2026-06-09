"use client";

import { useState, useEffect, useCallback } from "react";
import { visitasApi } from "@/lib/api/visitas";
import { getToken } from "@/lib/api/auth";

/**
 * Hook que gerencia o estado de check-in do usuário logado.
 *
 * - Carrega as visitas do backend ao montar (somente se houver token)
 * - Expõe `gastronomiasVisitadas` e `atividadesVisitadas` como Sets de IDs
 * - Expõe `toggleGastronomia` e `toggleAtividade` com estado otimista:
 *   atualiza a UI imediatamente e reverte em caso de erro
 */
export function useVisitas() {
  const [gastronomiasVisitadas, setGastronomiasVisitadas] = useState<Set<string>>(new Set());
  const [atividadesVisitadas, setAtividadesVisitadas] = useState<Set<string>>(new Set());
  const [carregando, setCarregando] = useState(false);

  const isLogado = Boolean(getToken());

  useEffect(() => {
    if (!isLogado) return;
    setCarregando(true);
    visitasApi
      .getMinhasVisitas()
      .then((data) => {
        setGastronomiasVisitadas(new Set(data.gastronomias));
        setAtividadesVisitadas(new Set(data.atividades));
      })
      .catch(() => {
        // Silencioso: se falhar, o usuário simplesmente não vê os check-ins
      })
      .finally(() => setCarregando(false));
  }, [isLogado]);

  const toggleGastronomia = useCallback(
    async (gastronomiaId: string) => {
      if (!isLogado) return;

      // Estado otimista
      setGastronomiasVisitadas((prev) => {
        const next = new Set(prev);
        if (next.has(gastronomiaId)) {
          next.delete(gastronomiaId);
        } else {
          next.add(gastronomiaId);
        }
        return next;
      });

      try {
        await visitasApi.toggleGastronomia(gastronomiaId);
      } catch {
        // Reverte em caso de erro
        setGastronomiasVisitadas((prev) => {
          const next = new Set(prev);
          if (next.has(gastronomiaId)) {
            next.delete(gastronomiaId);
          } else {
            next.add(gastronomiaId);
          }
          return next;
        });
      }
    },
    [isLogado]
  );

  const toggleAtividade = useCallback(
    async (atividadeId: string) => {
      if (!isLogado) return;

      setAtividadesVisitadas((prev) => {
        const next = new Set(prev);
        if (next.has(atividadeId)) {
          next.delete(atividadeId);
        } else {
          next.add(atividadeId);
        }
        return next;
      });

      try {
        await visitasApi.toggleAtividade(atividadeId);
      } catch {
        setAtividadesVisitadas((prev) => {
          const next = new Set(prev);
          if (next.has(atividadeId)) {
            next.delete(atividadeId);
          } else {
            next.add(atividadeId);
          }
          return next;
        });
      }
    },
    [isLogado]
  );

  return {
    gastronomiasVisitadas,
    atividadesVisitadas,
    carregando,
    isLogado,
    toggleGastronomia,
    toggleAtividade,
  };
}
