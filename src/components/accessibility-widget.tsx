"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAccessibilityVendors } from "@/hooks/useAccessibilityVendors";
import { usePageReader } from "@/hooks/usePageReader";

export function AccessibilityWidget() {
  const [aberto, setAberto] = useState(false);
  const [ouvirExpandido, setOuvirExpandido] = useState(false);

  const caixaRef = useRef<HTMLDivElement>(null);
  const painelRef = useRef<HTMLDivElement>(null);
  const botaoRef = useRef<HTMLButtonElement>(null);
  const botaoOuvirRef = useRef<HTMLButtonElement>(null);

  const focarBotaoPrincipalPlayer = useCallback(() => {
    botaoOuvirRef.current?.focus();
  }, []);

  const {
    librasPronto,
    siennaPronto,
    leitorParagrafoAtivo,
    definirLeitorParagrafo,
    alternarLeitorParagrafo,
    abrirLibras,
    abrirAjustesSienna,
  } = useAccessibilityVendors(botaoRef);

  const {
    suportaVoz,
    situacao,
    mensagemVoz,
    velocidade,
    iniciarLeitura,
    pausarLeitura,
    continuarLeitura,
    pararLeitura,
    aoMudarVelocidade,
  } = usePageReader(painelRef, focarBotaoPrincipalPlayer);

  const algumLeitorAtivo = situacao !== "parado" || leitorParagrafoAtivo;

  const alternarMenu = useCallback(() => {
    setAberto((atual) => {
      const proximo = !atual;
      if (proximo) {
        window.setTimeout(() => {
          const primeiro = painelRef.current?.querySelector<HTMLElement>(
            ".acesso-pilula, .ouvir-acao"
          );
          primeiro?.focus();
        }, 0);
      }
      return proximo;
    });
  }, []);

  useEffect(() => {
    const aoAlternarExterno = () => alternarMenu();
    window.addEventListener("apaixonese:toggle-acesso", aoAlternarExterno);
    return () => {
      window.removeEventListener("apaixonese:toggle-acesso", aoAlternarExterno);
    };
  }, [alternarMenu]);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("apaixonese:acesso-state", {
        detail: { aberto, ativo: algumLeitorAtivo },
      })
    );
  }, [aberto, algumLeitorAtivo]);

  useEffect(() => {
    const aoClicarFora = (e: MouseEvent) => {
      const alvo = e.target as HTMLElement | null;
      const clicouDentro =
        caixaRef.current && e.composedPath().includes(caixaRef.current);
      if (
        aberto &&
        !clicouDentro &&
        !alvo?.closest("[data-acesso-trigger]")
      ) {
        setAberto(false);
      }
    };

    const aoPressionarEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && aberto) {
        e.preventDefault();
        setAberto(false);
        botaoRef.current?.focus();
      }
    };

    document.addEventListener("click", aoClicarFora);
    document.addEventListener("keydown", aoPressionarEsc, true);
    return () => {
      document.removeEventListener("click", aoClicarFora);
      document.removeEventListener("keydown", aoPressionarEsc, true);
    };
  }, [aberto]);

  useEffect(() => {
    if (leitorParagrafoAtivo && situacao !== "parado") {
      pararLeitura("Leitura da página pausada para usar o Ouvir por parágrafo.");
    }
  }, [leitorParagrafoAtivo, pararLeitura, situacao]);

  const handleAlternarLeitorParagrafo = () => {
    if (!leitorParagrafoAtivo && situacao !== "parado") {
      pararLeitura();
    }
    alternarLeitorParagrafo();
    setAberto(false);
  };

  const handleAlternarLeituraPagina = () => {
    if (situacao === "parado") {
      if (leitorParagrafoAtivo) {
        definirLeitorParagrafo(false);
      }
      iniciarLeitura();
    } else if (situacao === "lendo") {
      pausarLeitura();
    } else {
      if (leitorParagrafoAtivo) {
        definirLeitorParagrafo(false);
      }
      continuarLeitura();
    }
  };

  if (!librasPronto && !siennaPronto && !suportaVoz) {
    return null;
  }

  return (
    <div ref={caixaRef} id="acesso" className="acesso asw-widget">
      <div
        ref={painelRef}
        id="acesso-painel"
        className="acesso-pilulas"
        role="group"
        aria-label="Ferramentas de acessibilidade"
        hidden={!aberto}
      >
        {librasPronto && (
          <button
            type="button"
            className="acesso-pilula"
            id="acesso-libras"
            onClick={() => {
              setAberto(false);
              abrirLibras();
            }}
          >
            <span className="acesso-pilula-icone" aria-hidden="true">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
                <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" />
                <path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" />
                <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
              </svg>
            </span>
            <span>Traduzir em Libras</span>
          </button>
        )}

        {siennaPronto && (
          <button
            type="button"
            className="acesso-pilula"
            id="acesso-ajustes"
            onClick={() => {
              setAberto(false);
              abrirAjustesSienna();
            }}
          >
            <span className="acesso-pilula-icone" aria-hidden="true">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4" />
              </svg>
            </span>
            <span>Menu de acessibilidade</span>
          </button>
        )}

        {siennaPronto && suportaVoz && (
          <button
            type="button"
            className="acesso-pilula"
            id="acesso-ouvir-paragrafo"
            aria-pressed={leitorParagrafoAtivo}
            onClick={handleAlternarLeitorParagrafo}
          >
            <span className="acesso-pilula-icone" aria-hidden="true">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 9h.01M15 9h.01M8 13a4 4 0 0 0 8 0" />
                <circle cx="12" cy="12" r="9" />
              </svg>
            </span>
            <span>Ouvir por parágrafo</span>
            {leitorParagrafoAtivo && (
              <span className="acesso-pilula-badge">Ativo</span>
            )}
          </button>
        )}

        {suportaVoz &&
          (!ouvirExpandido ? (
            <button
              type="button"
              className="acesso-pilula"
              id="acesso-ouvir"
              aria-expanded={false}
              onClick={() => setOuvirExpandido(true)}
            >
              <span className="acesso-pilula-icone" aria-hidden="true">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
                  <path d="M16 9a5 5 0 0 1 0 6" />
                  <path d="M19.364 18.364a9 9 0 0 0 0-12.728" />
                </svg>
              </span>
              <span>Ouvir página inteira</span>
              {situacao !== "parado" && (
                <span className="acesso-pilula-badge">
                  {situacao === "lendo" ? "Lendo" : "Pausado"}
                </span>
              )}
            </button>
          ) : (
            <section
              className="acesso-pilula-player"
              id="ouvir"
              aria-label="Ouvir página inteira"
            >
              <div className="acesso-player-topo">
                <span className="acesso-player-titulo">Ouvir página inteira</span>
                <button
                  type="button"
                  className="acesso-player-fechar"
                  aria-label="Recolher controles de leitura"
                  onClick={() => setOuvirExpandido(false)}
                >
                  ×
                </button>
              </div>

              <div className="acesso-player-controles">
                <button
                  ref={botaoOuvirRef}
                  type="button"
                  className="ouvir-acao ouvir-acao-principal"
                  onClick={handleAlternarLeituraPagina}
                >
                  {situacao === "lendo"
                    ? "Pausar"
                    : situacao === "pausado"
                      ? "Continuar"
                      : "Ouvir"}
                </button>

                {situacao !== "parado" && (
                  <button
                    type="button"
                    className="ouvir-acao"
                    onClick={() => pararLeitura()}
                  >
                    Parar
                  </button>
                )}

                <select
                  id="ouvir-velocidade"
                  aria-label="Velocidade da leitura"
                  className="ouvir-velocidade-compacta"
                  value={velocidade}
                  onChange={(e) => aoMudarVelocidade(e.target.value)}
                >
                  <option value="0.75">0,75×</option>
                  <option value="1">1×</option>
                  <option value="1.25">1,25×</option>
                  <option value="1.5">1,5×</option>
                </select>
              </div>

              <p className="ouvir-estado" id="ouvir-estado" aria-live="polite">
                {mensagemVoz}
              </p>
            </section>
          ))}
      </div>

      <button
        ref={botaoRef}
        type="button"
        className={`acesso-botao${algumLeitorAtivo ? " ativo" : ""}`}
        id="acesso-botao"
        aria-expanded={aberto}
        aria-controls="acesso-painel"
        aria-label="Acessibilidade: Libras, ajustes de leitura e ouvir a página"
        onClick={alternarMenu}
      >
        <svg
          className="icone"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="12" cy="6.8" r="1.5" />
          <path d="M7 9.6 12 11l5-1.4M12 11v3.4M9.4 18.2 12 14.4l2.6 3.8" />
        </svg>
        <span className="acesso-botao-texto">Acessibilidade</span>
      </button>
    </div>
  );
}
