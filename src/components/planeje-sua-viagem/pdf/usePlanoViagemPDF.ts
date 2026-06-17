"use client";

import { useState } from "react";
import { createElement } from "react";
import { apiFetch } from "@/lib/api/config";
import type { ItemPlanoViagem, PlanoViagem } from "@/lib/api/types";

/**
 * Hook responsavel por:
 * 1. Buscar todos os itens do plano via API (/plano-viagem/:id/itens)
 * 2. Importar dinamicamente @react-pdf/renderer (evita SSR crash no Next.js)
 * 3. Montar o componente PlanoViagemPDF com os dados
 * 4. Gerar o blob do PDF e disparar o download no browser
 */
export function usePlanoViagemPDF(plano: PlanoViagem) {
  const [exportando, setExportando] = useState(false);

  async function exportarPDF() {
    if (exportando) return;
    setExportando(true);

    try {
      // 1. Busca os itens do plano via endpoint dedicado
      const itens = await apiFetch<ItemPlanoViagem[]>(
        `/plano-viagem/${plano.id}/itens`
      );

      // 2. Importa dinamicamente — so roda no browser, nunca no servidor
      const [{ pdf }, { PlanoViagemPDF }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./PlanoViagemPDF"),
      ]);

      // 3. Monta o documento PDF
      const documento = createElement(PlanoViagemPDF, { plano, itens });

      // 4. Gera o blob e dispara download
      const blob = await pdf(documento).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const nomeArquivo = plano.titulo
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .toLowerCase();
      link.href = url;
      link.download = `plano-viagem-${nomeArquivo}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("[usePlanoViagemPDF] Erro ao gerar PDF:", err);
      alert(
        `Nao foi possivel gerar o PDF.\n\nDetalhe: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setExportando(false);
    }
  }

  return { exportando, exportarPDF };
}
