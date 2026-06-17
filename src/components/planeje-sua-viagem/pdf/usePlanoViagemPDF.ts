"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { createElement } from "react";
import { itemPlanoViagemApi } from "@/lib/api/plano-viagem";
import type { PlanoViagem } from "@/lib/api/types";
import { PlanoViagemPDF } from "./PlanoViagemPDF";

/**
 * Hook responsavel por:
 * 1. Buscar todos os itens do plano via API
 * 2. Montar o componente PlanoViagemPDF com os dados
 * 3. Gerar o blob do PDF usando @react-pdf/renderer
 * 4. Fazer o download automatico no browser
 *
 * Uso:
 *   const { exportando, exportarPDF } = usePlanoViagemPDF(plano);
 */
export function usePlanoViagemPDF(plano: PlanoViagem) {
  const [exportando, setExportando] = useState(false);

  async function exportarPDF() {
    if (exportando) return;
    setExportando(true);

    try {
      // 1. Busca os itens do plano
      const itens = await itemPlanoViagemApi.listar(plano.id);

      // 2. Monta o documento PDF como elemento React
      const documento = createElement(PlanoViagemPDF, { plano, itens });

      // 3. Gera o blob do PDF
      const blob = await pdf(documento).toBlob();

      // 4. Cria um link temporario e dispara o download
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const nomeArquivo = plano.titulo
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remove acentos
        .replace(/[^a-zA-Z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .toLowerCase();
      link.href = url;
      link.download = `plano-viagem-${nomeArquivo}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      alert("N\u00e3o foi poss\u00edvel gerar o PDF. Tente novamente.");
    } finally {
      setExportando(false);
    }
  }

  return { exportando, exportarPDF };
}
