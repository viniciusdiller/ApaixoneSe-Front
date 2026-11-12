"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";

declare global {
  interface Window {
    VLibras?: {
      Widget: new (options: { rootPath: string; position?: string }) => unknown;
    };
    VLibrasWidget?: {
      open?: () => void;
    };
  }
}

type SituacaoLeitura = "parado" | "lendo" | "pausado";

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

export function AccessibilityWidget() {
  const pathname = usePathname();

  const [aberto, setAberto] = useState(false);
  const [librasPronto, setLibrasPronto] = useState(false);
  const [siennaPronto, setSiennaPronto] = useState(false);
  const [suportaVoz, setSuportaVoz] = useState(false);

  const [situacao, setSituacao] = useState<SituacaoLeitura>("parado");
  const [mensagemVoz, setMensagemVoz] = useState(
    "Lê em voz alta o conteúdo principal, sem menus nem rodapé."
  );
  const [velocidade, setVelocidade] = useState("1");

  const caixaRef = useRef<HTMLDivElement>(null);
  const painelRef = useRef<HTMLDivElement>(null);
  const botaoRef = useRef<HTMLButtonElement>(null);
  const botaoLerRef = useRef<HTMLButtonElement>(null);
  const botaoPausarRef = useRef<HTMLButtonElement>(null);
  const botaoContinuarRef = useRef<HTMLButtonElement>(null);

  const trechosRef = useRef<string[]>([]);
  const posicaoRef = useRef<number>(0);
  const rodadaRef = useRef<number>(0);
  const situacaoRef = useRef<SituacaoLeitura>("parado");
  const velocidadeRef = useRef<string>("1");
  const vozRef = useRef<SpeechSynthesisVoice | null>(null);

  // Remove tamanhos fixos em px gravados pelo Sienna 2.1.0 quando a escala está em 100%
  const liberarTamanhos = useCallback(() => {
    let escala = 1;
    try {
      const salvo = JSON.parse(localStorage.getItem("asw-user-settings") || "{}");
      escala = Number(salvo?.states?.fontSize) || 1;
    } catch {
      escala = 1;
    }
    if (escala !== 1) return;

    document.querySelectorAll<HTMLElement>("[data-asw-org-font-size]").forEach((el) => {
      el.style.removeProperty("font-size");
      el.removeAttribute("data-asw-org-font-size");
    });
  }, []);

  // Traduz os aria-label internos do Sienna 2.1.0 para português
  const traduzirRotulosSienna = useCallback(() => {
    const menu = document.querySelector<HTMLElement>(".asw-menu");
    if (!menu) return;

    const fechar = menu.querySelector<HTMLElement>(".asw-menu-close");
    if (fechar) {
      fechar.setAttribute("aria-label", "Fechar os ajustes de leitura");
      fechar.title = "Fechar";
    }

    const restaurar = menu.querySelector<HTMLElement>(".asw-menu-reset");
    if (restaurar) {
      restaurar.setAttribute("aria-label", "Restaurar as configurações");
      restaurar.title = "Restaurar as configurações";
    }

    menu.querySelectorAll<HTMLElement>("[aria-label]").forEach((elemento) => {
      if (elemento === fechar || elemento === restaurar) return;
      if (elemento.tagName === "SELECT") {
        elemento.setAttribute("aria-label", "Idioma do menu");
        return;
      }
      const texto = (elemento.innerText || "").trim().split("\n")[0];
      if (texto) elemento.setAttribute("aria-label", texto);
    });
  }, []);

  // Inicializa Sienna 2.1.0 e VLibras no cliente
  useEffect(() => {
    let cancelado = false;

    // 1. Carrega Sienna 2.1.0
    import("sienna-accessibility")
      .then(() => {
        if (cancelado) return;
        const verificarBotaoSienna = () => {
          const btn = document.querySelector(".asw-menu-btn");
          if (!btn) return false;
          setSiennaPronto(true);
          liberarTamanhos();
          return true;
        };
        if (!verificarBotaoSienna()) {
          const obs = new MutationObserver(() => {
            if (verificarBotaoSienna()) obs.disconnect();
          });
          obs.observe(document.body, { childList: true });
        }
      })
      .catch((err) => {
        console.error("Falha ao carregar o widget Sienna:", err);
      });

    // 2. Carrega VLibras oficial (vlibras.gov.br)
    const iniciarVLibras = () => {
      if (cancelado || !window.VLibras) return;
      try {
        if (!document.getElementById("vlibras-access-wrapper")) {
          new window.VLibras.Widget({
            rootPath: "https://vlibras.gov.br/app",
            position: "R",
          });
        }
        setLibrasPronto(true);
      } catch (err) {
        console.error("Falha ao iniciar o VLibras:", err);
      }
    };

    if (window.VLibras) {
      iniciarVLibras();
    } else {
      const scriptExistente = document.querySelector<HTMLScriptElement>(
        'script[src="https://vlibras.gov.br/app/vlibras-plugin.js"]'
      );
      if (scriptExistente) {
        scriptExistente.addEventListener("load", iniciarVLibras);
      } else {
        const script = document.createElement("script");
        script.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
        script.async = true;
        script.onload = iniciarVLibras;
        document.body.appendChild(script);
      }
    }

    // 3. Verifica suporte à Web Speech API ("Ouvir esta página")
    if ("speechSynthesis" in window && "SpeechSynthesisUtterance" in window) {
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
    }

    return () => {
      cancelado = true;
    };
  }, [liberarTamanhos]);

  // Escuta cliques no menu do Sienna (para liberar tamanhos em 100%) e teclado global (Esc / Enter)
  useEffect(() => {
    const aoClicarNoDocumento = (e: MouseEvent) => {
      const alvo = e.target as HTMLElement | null;
      if (alvo?.closest?.(".asw-menu")) {
        window.setTimeout(liberarTamanhos, 50);
      }
      if (
        aberto &&
        caixaRef.current &&
        alvo &&
        !caixaRef.current.contains(alvo)
      ) {
        setAberto(false);
      }
    };

    const siennaAberto = () => {
      const menu = document.querySelector<HTMLElement>(".asw-menu");
      return !!menu && menu.parentElement?.style.display !== "none";
    };

    const fecharAjustesSienna = () => {
      const fechar = document.querySelector<HTMLElement>(".asw-menu .asw-menu-close");
      fechar?.click();
      botaoRef.current?.focus();
    };

    const aoPressionarTecla = (e: KeyboardEvent) => {
      if (e.key === "Escape" && aberto) {
        e.preventDefault();
        setAberto(false);
        botaoRef.current?.focus();
        return;
      }
      if (!siennaAberto()) return;
      if (e.key === "Escape") {
        e.preventDefault();
        fecharAjustesSienna();
        return;
      }
      const alvo = e.target as HTMLElement | null;
      const menu = document.querySelector<HTMLElement>(".asw-menu");
      if (
        (e.key === "Enter" || e.key === " ") &&
        alvo?.getAttribute("role") === "button" &&
        alvo.tagName !== "BUTTON" &&
        alvo.tagName !== "A" &&
        menu?.contains(alvo)
      ) {
        e.preventDefault();
        if (alvo.classList.contains("asw-menu-close")) {
          fecharAjustesSienna();
        } else {
          alvo.click();
        }
      }
    };

    document.addEventListener("click", aoClicarNoDocumento);
    document.addEventListener("keydown", aoPressionarTecla, true);
    return () => {
      document.removeEventListener("click", aoClicarNoDocumento);
      document.removeEventListener("keydown", aoPressionarTecla, true);
    };
  }, [aberto, liberarTamanhos]);

  // Funções de leitura em voz alta ("Ouvir esta página")
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
        if (
          focado &&
          focado.disabled &&
          painelRef.current?.contains(focado)
        ) {
          const mapaFoco: Record<SituacaoLeitura, HTMLButtonElement | null> = {
            parado: botaoLerRef.current,
            lendo: botaoPausarRef.current,
            pausado: botaoContinuarRef.current,
          };
          mapaFoco[novaSituacao]?.focus();
        }
      }, 0);
    },
    []
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

  const extrairTextoDaPagina = useCallback(() => {
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
  }, []);

  const iniciarLeitura = () => {
    silenciar();
    trechosRef.current = extrairTextoDaPagina();
    posicaoRef.current = 0;
    if (!trechosRef.current.length) {
      pararLeitura("Não há texto para ler nesta página.");
      return;
    }
    falarTrechoAtual();
  };

  const pausarLeitura = () => {
    if (situacaoRef.current !== "lendo") return;
    silenciar();
    atualizarSituacao(
      "pausado",
      `Pausado no trecho ${posicaoRef.current + 1} de ${trechosRef.current.length}.`
    );
  };

  const continuarLeitura = () => {
    if (situacaoRef.current !== "pausado") return;
    falarTrechoAtual();
  };

  const aoMudarVelocidade = (novoValor: string) => {
    setVelocidade(novoValor);
    velocidadeRef.current = novoValor;
    if (situacaoRef.current === "lendo") {
      silenciar();
      falarTrechoAtual();
    }
  };

  // Para a leitura ao navegar entre rotas no Next.js ou ao sair da página
  useEffect(() => {
    liberarTamanhos();
    if (situacaoRef.current !== "parado") {
      pararLeitura("A página mudou. Use “Ouvir” para ler a nova página.");
    }
  }, [pathname, liberarTamanhos, pararLeitura]);

  useEffect(() => {
    const aoSair = () => silenciar();
    window.addEventListener("pagehide", aoSair);
    return () => {
      window.removeEventListener("pagehide", aoSair);
      silenciar();
    };
  }, [silenciar]);

  // Ações do menu rápido
  const alternarMenu = () => {
    const proximo = !aberto;
    setAberto(proximo);
    if (proximo) {
      window.setTimeout(() => {
        const primeiro = painelRef.current?.querySelector<HTMLElement>(
          ".acesso-opcao, .ouvir button:not(:disabled)"
        );
        primeiro?.focus();
      }, 0);
    }
  };

  const abrirLibras = () => {
    setAberto(false);
    window.VLibrasWidget?.open?.();

    if (window.matchMedia("(pointer: coarse)").matches) {
      try {
        if (!localStorage.getItem("apaixonese-dica-libras")) {
          localStorage.setItem("apaixonese-dica-libras", "1");
          window.setTimeout(() => {
            toast("Dica: arraste o avatar pela barra azul para tirá-lo da frente.");
          }, 1500);
        }
      } catch {
        // Sem localStorage disponível
      }
    }
  };

  const abrirAjustesSienna = () => {
    setAberto(false);
    const botaoSienna = document.querySelector<HTMLElement>(".asw-menu-btn");
    if (!botaoSienna) return;
    botaoSienna.click();
    window.setTimeout(() => {
      const menu = document.querySelector<HTMLElement>(".asw-menu");
      if (!menu || menu.parentElement?.style.display === "none") return;
      traduzirRotulosSienna();
      menu.querySelector<HTMLElement>(".asw-menu-close")?.focus();
    }, 60);
  };

  const mostrarComponente = librasPronto || siennaPronto || suportaVoz;
  if (!mostrarComponente) return null;

  return (
    <div ref={caixaRef} id="acesso" className="acesso">
      <div
        ref={painelRef}
        id="acesso-painel"
        className="acesso-painel"
        role="group"
        aria-labelledby="acesso-titulo"
        hidden={!aberto}
      >
        <p className="acesso-titulo" id="acesso-titulo">
          Acessibilidade
        </p>

        <div className="acesso-opcoes">
          {librasPronto && (
            <button
              type="button"
              className="acesso-opcao"
              id="acesso-libras"
              onClick={abrirLibras}
            >
              <svg
                className="icone"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
                <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" />
                <path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" />
                <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
              </svg>
              <span>
                <strong>Libras</strong>
                <small>Tradução da página com o VLibras</small>
              </span>
            </button>
          )}

          {siennaPronto && (
            <button
              type="button"
              className="acesso-opcao"
              id="acesso-ajustes"
              onClick={abrirAjustesSienna}
            >
              <svg
                className="icone"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4" />
              </svg>
              <span>
                <strong>Ajustes de leitura</strong>
                <small>Tamanho da fonte, contraste, links e animações</small>
              </span>
            </button>
          )}
        </div>

        {suportaVoz && (
          <section
            className="ouvir"
            id="ouvir"
            aria-labelledby="ouvir-titulo"
          >
            <p className="ouvir-titulo" id="ouvir-titulo">
              <svg
                className="icone"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
                <path d="M16 9a5 5 0 0 1 0 6" />
                <path d="M19.364 18.364a9 9 0 0 0 0-12.728" />
              </svg>
              Ouvir esta página
            </p>
            <p className="ouvir-estado" id="ouvir-estado" aria-live="polite">
              {mensagemVoz}
            </p>
            <div className="ouvir-botoes">
              <button
                ref={botaoLerRef}
                type="button"
                className="ouvir-acao"
                id="ouvir-ler"
                disabled={situacao !== "parado"}
                onClick={iniciarLeitura}
              >
                <svg
                  className="icone"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M6 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L7.5 3.64A1 1 0 0 0 6 4.5Z" />
                </svg>
                Ouvir
              </button>
              <button
                ref={botaoPausarRef}
                type="button"
                className="ouvir-acao"
                id="ouvir-pausar"
                disabled={situacao !== "lendo"}
                onClick={pausarLeitura}
              >
                <svg
                  className="icone"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                </svg>
                Pausar
              </button>
              <button
                ref={botaoContinuarRef}
                type="button"
                className="ouvir-acao"
                id="ouvir-continuar"
                disabled={situacao !== "pausado"}
                onClick={continuarLeitura}
              >
                <svg
                  className="icone"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M6 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L7.5 3.64A1 1 0 0 0 6 4.5Z" />
                </svg>
                Continuar
              </button>
              <button
                type="button"
                className="ouvir-acao"
                id="ouvir-parar"
                disabled={situacao === "parado"}
                onClick={() => pararLeitura()}
              >
                <svg
                  className="icone"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  <rect width="14" height="14" x="5" y="5" rx="2" />
                </svg>
                Parar
              </button>
            </div>
            <label className="ouvir-velocidade" htmlFor="ouvir-velocidade">
              Velocidade
              <select
                id="ouvir-velocidade"
                value={velocidade}
                onChange={(e) => aoMudarVelocidade(e.target.value)}
              >
                <option value="0.75">0,75× (mais devagar)</option>
                <option value="1">1× (normal)</option>
                <option value="1.25">1,25×</option>
                <option value="1.5">1,5× (mais rápido)</option>
              </select>
            </label>
          </section>
        )}
      </div>

      <button
        ref={botaoRef}
        type="button"
        className={`acesso-botao${situacao !== "parado" ? " ativo" : ""}`}
        id="acesso-botao"
        aria-expanded={aberto}
        aria-controls="acesso-painel"
        aria-label="Acessibilidade: Libras, ajustes de leitura e ouvir a página"
        onClick={alternarMenu}
      >
        <svg
          className="icone"
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="6.8" r="1.5" />
          <path d="M7 9.6 12 11l5-1.4M12 11v3.4M9.4 18.2 12 14.4l2.6 3.8" />
        </svg>
      </button>
    </div>
  );
}
