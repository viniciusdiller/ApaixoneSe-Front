"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export type SituacaoLeitura = "parado" | "lendo" | "pausado";

const IGNORAR_NA_LEITURA = [
  "[aria-hidden='true']",
  "[hidden]",
  "script",
  "style",
  "template",
  "dialog",
  "form",
  "select",
  "#acesso",
].join(",");

const TAMANHO_TRECHO = 220;

function extrairTrechosDaPagina(): string[] {
  const raiz =
    Array.from(document.querySelectorAll<HTMLElement>("main")).find(
      (m) => !m.closest("[hidden]")
    ) || document.body;

  const percorrer = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
  const blocos: string[] = [];
  let blocoAtual: Element | null = null;
  let paiAnterior: Element | null = null;
  let noDeTexto: Node | null;

  while ((noDeTexto = percorrer.nextNode())) {
    const pai = noDeTexto.parentElement;
    const conteudo = (noDeTexto.nodeValue || "").replace(/\s+/g, " ");
    if (!conteudo.trim() || !pai || pai.closest(IGNORAR_NA_LEITURA)) continue;

    const bloco =
      pai.closest(
        "h1, h2, h3, h4, h5, h6, p, li, dt, dd, button, a, td, th, small, strong"
      ) || pai;

    if (bloco !== blocoAtual) {
      blocos.push("");
      blocoAtual = bloco;
    } else if (
      pai !== paiAnterior &&
      !/[\s,.;:]$/.test(blocos[blocos.length - 1])
    ) {
      blocos[blocos.length - 1] += ", ";
    }

    blocos[blocos.length - 1] += conteudo;
    paiAnterior = pai;
  }

  const textoUnido = blocos
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => (/[.!?:…]$/.test(b) ? b : `${b}.`))
    .join(" ");

  const frases = textoUnido.match(/[^.!?…]+[.!?…]*\s*/g) || [];
  const lista: string[] = [];
  let atual = "";

  frases.forEach((frase) => {
    if ((atual + frase).length > TAMANHO_TRECHO && atual) {
      lista.push(atual.trim());
      atual = "";
    }
    atual += frase;
  });
  if (atual.trim()) lista.push(atual.trim());

  return lista;
}

export function usePageReader(
  painelRef: React.RefObject<HTMLDivElement>,
  onFocusFallback?: (novaSituacao: SituacaoLeitura) => void
) {
  const pathname = usePathname();

  const [suportaVoz, setSuportaVoz] = useState(false);
  const [situacao, setSituacao] = useState<SituacaoLeitura>("parado");
  const [mensagemVoz, setMensagemVoz] = useState("Pronto para ler a página.");
  const [velocidade, setVelocidade] = useState("1");

  const trechosRef = useRef<string[]>([]);
  const posicaoRef = useRef<number>(0);
  const rodadaRef = useRef<number>(0);
  const situacaoRef = useRef<SituacaoLeitura>("parado");
  const velocidadeRef = useRef<string>("1");
  const vozRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      return;
    }
    setSuportaVoz(true);
    const sintese = window.speechSynthesis;
    const escolherVoz = () => {
      const vozes = sintese.getVoices();
      vozRef.current =
        vozes.find((v) => /^pt[-_]BR$/i.test(v.lang)) ||
        vozes.find((v) => /^pt/i.test(v.lang)) ||
        null;
    };
    escolherVoz();
    sintese.addEventListener?.("voiceschanged", escolherVoz);
    return () => {
      sintese.removeEventListener?.("voiceschanged", escolherVoz);
    };
  }, []);

  const silenciar = useCallback(() => {
    rodadaRef.current += 1;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const atualizarSituacao = useCallback(
    (novaSituacao: SituacaoLeitura, mensagem: string) => {
      situacaoRef.current = novaSituacao;
      setSituacao(novaSituacao);
      setMensagemVoz(mensagem);

      window.setTimeout(() => {
        const focado = document.activeElement as HTMLButtonElement | null;
        if (focado && focado.disabled && painelRef.current?.contains(focado)) {
          onFocusFallback?.(novaSituacao);
        }
      }, 0);
    },
    [onFocusFallback, painelRef]
  );

  const pararLeitura = useCallback(
    (mensagem?: string) => {
      silenciar();
      posicaoRef.current = 0;
      atualizarSituacao("parado", mensagem || "Leitura parada.");
    },
    [atualizarSituacao, silenciar]
  );

  const falarTrechoAtual = useCallback(() => {
    if (!("speechSynthesis" in window)) return;
    const trechos = trechosRef.current;
    const pos = posicaoRef.current;

    if (pos >= trechos.length) {
      pararLeitura("Leitura concluída.");
      return;
    }

    const minhaRodada = rodadaRef.current;
    const fala = new SpeechSynthesisUtterance(trechos[pos]);
    fala.lang = "pt-BR";
    if (vozRef.current) fala.voice = vozRef.current;
    fala.rate = Number(velocidadeRef.current) || 1;

    fala.onend = () => {
      if (minhaRodada !== rodadaRef.current || situacaoRef.current !== "lendo") {
        return;
      }
      posicaoRef.current += 1;
      falarTrechoAtual();
    };

    fala.onerror = (erro) => {
      if (
        minhaRodada !== rodadaRef.current ||
        erro.error === "interrupted" ||
        erro.error === "canceled"
      ) {
        return;
      }
      pararLeitura("Não foi possível ler a página neste navegador.");
    };

    atualizarSituacao(
      "lendo",
      `Lendo… trecho ${pos + 1} de ${trechos.length}.`
    );
    window.speechSynthesis.speak(fala);
  }, [atualizarSituacao, pararLeitura]);

  const iniciarLeitura = useCallback(() => {
    silenciar();
    trechosRef.current = extrairTrechosDaPagina();
    posicaoRef.current = 0;
    if (!trechosRef.current.length) {
      pararLeitura("Não há texto para ler nesta página.");
      return;
    }
    falarTrechoAtual();
  }, [falarTrechoAtual, pararLeitura, silenciar]);

  const pausarLeitura = useCallback(() => {
    if (situacaoRef.current !== "lendo") return;
    silenciar();
    atualizarSituacao(
      "pausado",
      `Pausado no trecho ${posicaoRef.current + 1} de ${trechosRef.current.length}.`
    );
  }, [atualizarSituacao, silenciar]);

  const continuarLeitura = useCallback(() => {
    if (situacaoRef.current !== "pausado") return;
    falarTrechoAtual();
  }, [falarTrechoAtual]);

  const aoMudarVelocidade = useCallback(
    (novoValor: string) => {
      setVelocidade(novoValor);
      velocidadeRef.current = novoValor;
      if (situacaoRef.current === "lendo") {
        silenciar();
        falarTrechoAtual();
      }
    },
    [falarTrechoAtual, silenciar]
  );

  useEffect(() => {
    if (situacaoRef.current !== "parado") {
      pararLeitura("A página mudou. Use “Ouvir” para ler a nova página.");
    }
  }, [pathname, pararLeitura]);

  useEffect(() => {
    const aoSair = () => silenciar();
    window.addEventListener("pagehide", aoSair);
    return () => {
      window.removeEventListener("pagehide", aoSair);
      silenciar();
    };
  }, [silenciar]);

  return {
    suportaVoz,
    situacao,
    mensagemVoz,
    velocidade,
    iniciarLeitura,
    pausarLeitura,
    continuarLeitura,
    pararLeitura,
    aoMudarVelocidade,
  };
}
