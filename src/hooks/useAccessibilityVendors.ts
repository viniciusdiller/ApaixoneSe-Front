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
    __asw__onClickScreenReader?: (e: MouseEvent) => void;
  }
}

const VLIBRAS_SCRIPT_URL = "https://vlibras.gov.br/app/vlibras-plugin.js";

function instalarProtetorListenerSienna() {
  if (typeof window === "undefined") return;

  if (
    typeof SVGElement !== "undefined" &&
    !("innerText" in SVGElement.prototype)
  ) {
    Object.defineProperty(SVGElement.prototype, "innerText", {
      configurable: true,
      enumerable: false,
      get(this: SVGElement) {
        return this.textContent || "";
      },
    });
  }

  const desc = Object.getOwnPropertyDescriptor(
    window,
    "__asw__onClickScreenReader"
  );
  if (desc && desc.set) return;

  let fnAtual = window.__asw__onClickScreenReader;
  Object.defineProperty(window, "__asw__onClickScreenReader", {
    configurable: true,
    enumerable: true,
    get() {
      return fnAtual;
    },
    set(novaFn: ((e: MouseEvent) => void) | undefined) {
      if (fnAtual && fnAtual !== novaFn) {
        document.removeEventListener("click", fnAtual, true);
      }
      fnAtual = novaFn;
    },
  });
}

function liberarTamanhosSienna() {
  let escala = 1;
  try {
    const salvo = JSON.parse(localStorage.getItem("asw-user-settings") || "{}");
    escala = Number(salvo?.states?.fontSize) || 1;
  } catch {
    escala = 1;
  }
  if (escala !== 1) return;

  document
    .querySelectorAll<HTMLElement>("[data-asw-org-font-size]")
    .forEach((el) => {
      el.style.removeProperty("font-size");
      el.removeAttribute("data-asw-org-font-size");
    });
}

function restaurarCorElementoSienna(el: HTMLElement) {
  if (!el.hasAttribute("data-asw-orgcolor")) return;
  const corOriginal = el.getAttribute("data-asw-orgcolor");
  if (corOriginal) {
    el.style.color = corOriginal;
  } else {
    el.style.removeProperty("color");
  }
  el.removeAttribute("data-asw-orgcolor");
}

function limparDestaquesLeituraSienna() {
  document.querySelectorAll<HTMLElement>(".asw-reading").forEach((el) => {
    el.classList.remove("asw-reading");
    restaurarCorElementoSienna(el);
  });
}

function traduzirRotulosSienna() {
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
}

function garantirMenuSiennaNoDom(): HTMLElement | null {
  let menu = document.querySelector<HTMLElement>(".asw-menu");
  if (menu) return menu;

  const botaoSienna = document.querySelector<HTMLElement>(".asw-menu-btn");
  if (!botaoSienna) return null;

  botaoSienna.click();
  menu = document.querySelector<HTMLElement>(".asw-menu");
  menu?.querySelector<HTMLElement>(".asw-menu-close")?.click();
  return menu;
}

export function useAccessibilityVendors(
  botaoRetornoRef: React.RefObject<HTMLButtonElement>
) {
  const pathname = usePathname();
  const [siennaPronto, setSiennaPronto] = useState(false);
  const [leitorParagrafoAtivo, setLeitorParagrafoAtivo] = useState(false);

  const ultimoInterativoRef = useRef<HTMLElement | null>(null);
  const timerInterativoRef = useRef<number>(0);

  const definirLeitorParagrafo = useCallback((ativo: boolean) => {
    const estaAtivo =
      document.documentElement.classList.contains("asw-screen-reader");
    if (estaAtivo === ativo) {
      setLeitorParagrafoAtivo(ativo);
      return;
    }

    const menu = garantirMenuSiennaNoDom();
    const btnScreenReader = menu?.querySelector<HTMLElement>(
      ".asw-btn[data-key='screen-reader']"
    );
    if (btnScreenReader) {
      btnScreenReader.click();
      if (!ativo) {
        limparDestaquesLeituraSienna();
      }
      setLeitorParagrafoAtivo(
        document.documentElement.classList.contains("asw-screen-reader")
      );
    }
  }, []);

  const alternarLeitorParagrafo = useCallback(() => {
    const estaAtivo =
      document.documentElement.classList.contains("asw-screen-reader");
    definirLeitorParagrafo(!estaAtivo);
  }, [definirLeitorParagrafo]);

  useEffect(() => {
    let cancelado = false;
    let obsSienna: MutationObserver | null = null;
    let scriptExistenteRef: HTMLScriptElement | null = null;

    instalarProtetorListenerSienna();

    const sincronizarClasseLeitor = () => {
      const ativo =
        document.documentElement.classList.contains("asw-screen-reader");
      setLeitorParagrafoAtivo(ativo);
      if (!ativo) {
        limparDestaquesLeituraSienna();
      }
    };

    const obsHtml = new MutationObserver(sincronizarClasseLeitor);
    obsHtml.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    sincronizarClasseLeitor();

    const obsCorSienna = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.target instanceof HTMLElement) {
          restaurarCorElementoSienna(m.target);
        }
      }
    });
    obsCorSienna.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-asw-orgcolor"],
    });

    import("sienna-accessibility")
      .then(() => {
        if (cancelado) return;
        const verificarBotaoSienna = () => {
          if (!document.querySelector(".asw-menu-btn")) return false;
          setSiennaPronto(true);
          liberarTamanhosSienna();
          sincronizarClasseLeitor();
          return true;
        };
        if (!verificarBotaoSienna()) {
          obsSienna = new MutationObserver(() => {
            if (verificarBotaoSienna()) {
              obsSienna?.disconnect();
              obsSienna = null;
            }
          });
          obsSienna.observe(document.body, { childList: true });
        }
      })
      .catch((err) => {
        console.error("Falha ao carregar o widget Sienna:", err);
      });

    const iniciarVLibras = () => {
      if (cancelado || !window.VLibras) return;
      try {
        if (!document.getElementById("vlibras-access-wrapper")) {
          new window.VLibras.Widget({
            rootPath: "https://vlibras.gov.br/app",
            position: "R",
          });
        }
      } catch (err) {
        console.error("Falha ao iniciar o VLibras:", err);
      }
    };

    if (window.VLibras) {
      iniciarVLibras();
    } else {
      const scriptExistente = document.querySelector<HTMLScriptElement>(
        `script[src="${VLIBRAS_SCRIPT_URL}"]`
      );
      if (scriptExistente) {
        scriptExistenteRef = scriptExistente;
        scriptExistente.addEventListener("load", iniciarVLibras);
      } else {
        const script = document.createElement("script");
        script.src = VLIBRAS_SCRIPT_URL;
        script.async = true;
        script.onload = iniciarVLibras;
        document.body.appendChild(script);
      }
    }

    return () => {
      cancelado = true;
      obsSienna?.disconnect();
      obsHtml.disconnect();
      obsCorSienna.disconnect();
      scriptExistenteRef?.removeEventListener("load", iniciarVLibras);
      window.clearTimeout(timerInterativoRef.current);
    };
  }, []);

  useEffect(() => {
    liberarTamanhosSienna();
    ultimoInterativoRef.current = null;
  }, [pathname]);

  useEffect(() => {
    const liberarElementoDoVLibras = (el: Element) => {
      if (el.classList.contains("vlibras-links")) return;
      el.classList.add("vlibras-links");
      window.setTimeout(() => {
        el.classList.remove("vlibras-links");
      }, 0);
    };

    const ignorarCliqueNoSiennaUmaVez = () => {
      const fnSienna = window.__asw__onClickScreenReader;
      if (!fnSienna) return;
      document.removeEventListener("click", fnSienna, true);
      window.setTimeout(() => {
        if (
          document.documentElement.classList.contains("asw-screen-reader") &&
          window.__asw__onClickScreenReader === fnSienna
        ) {
          document.addEventListener("click", fnSienna, true);
        }
      }, 0);
    };

    const aoCapturarCliqueNaJanela = (e: MouseEvent) => {
      const alvo = e.target as HTMLElement | null;
      if (!alvo) return;

      const dentroDoVLibras = !!alvo.closest(
        "#vlibras-app-root, #vlibras-access-wrapper"
      );

      const dentroDoMenuAcessibilidade =
        !!alvo.closest("#acesso") ||
        !!alvo.closest("[data-acesso-trigger]") ||
        !!alvo.closest(".asw-container") ||
        !!alvo.closest(".asw-menu") ||
        !!alvo.closest(".asw-menu-btn") ||
        !!alvo.closest(".asw-widget") ||
        !!alvo.closest(".asw-structure-modal");

      const interativo = alvo.closest<HTMLElement>(
        "a[href], button, [role='button'], input, select, label"
      );
      const textoVisivel = (interativo?.innerText || "").trim();
      const semTextoParaLer =
        !!interativo && (!textoVisivel || /^[×✕xX+-]$/.test(textoVisivel));

      if (dentroDoMenuAcessibilidade || semTextoParaLer) {
        liberarElementoDoVLibras(alvo);
        if (interativo && interativo !== alvo) {
          liberarElementoDoVLibras(interativo);
        }
      }

      if (!document.documentElement.classList.contains("asw-screen-reader")) {
        return;
      }

      if (dentroDoVLibras) {
        ignorarCliqueNoSiennaUmaVez();
        return;
      }

      if (dentroDoMenuAcessibilidade) {
        return;
      }

      if (!interativo) {
        ultimoInterativoRef.current = null;
        return;
      }

      if (semTextoParaLer || ultimoInterativoRef.current === interativo) {
        ultimoInterativoRef.current = null;
        window.clearTimeout(timerInterativoRef.current);
        window.speechSynthesis?.cancel();
        limparDestaquesLeituraSienna();
        ignorarCliqueNoSiennaUmaVez();
        return;
      }

      ultimoInterativoRef.current = interativo;
      window.clearTimeout(timerInterativoRef.current);
      timerInterativoRef.current = window.setTimeout(() => {
        if (ultimoInterativoRef.current === interativo) {
          ultimoInterativoRef.current = null;
        }
      }, 4000);
    };

    const aoClicarNoSienna = (e: MouseEvent) => {
      const alvo = e.target as HTMLElement | null;
      if (alvo?.closest?.(".asw-menu")) {
        window.setTimeout(liberarTamanhosSienna, 50);
      }
    };

    const siennaAberto = () => {
      const menu = document.querySelector<HTMLElement>(".asw-menu");
      return !!menu && menu.parentElement?.style.display !== "none";
    };

    const fecharAjustesSienna = () => {
      document
        .querySelector<HTMLElement>(".asw-menu .asw-menu-close")
        ?.click();
      botaoRetornoRef.current?.focus();
    };

    const aoPressionarTeclaSienna = (e: KeyboardEvent) => {
      if (siennaAberto()) {
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
        return;
      }

      if (
        e.key === "Escape" &&
        document.documentElement.classList.contains("asw-screen-reader")
      ) {
        definirLeitorParagrafo(false);
      }
    };

    window.addEventListener("click", aoCapturarCliqueNaJanela, true);
    document.addEventListener("click", aoClicarNoSienna);
    document.addEventListener("keydown", aoPressionarTeclaSienna, true);
    return () => {
      window.removeEventListener("click", aoCapturarCliqueNaJanela, true);
      document.removeEventListener("click", aoClicarNoSienna);
      document.removeEventListener("keydown", aoPressionarTeclaSienna, true);
    };
  }, [botaoRetornoRef, definirLeitorParagrafo]);

  const abrirLibras = useCallback(() => {
    if (!window.VLibras || !window.VLibrasWidget?.open) {
      toast(
        "Libras indisponível no momento. Recarregue a página ou tente novamente mais tarde."
      );
      return;
    }

    window.VLibrasWidget.open();

    if (window.matchMedia("(pointer: coarse)").matches) {
      try {
        if (!localStorage.getItem("apaixonese-dica-libras")) {
          localStorage.setItem("apaixonese-dica-libras", "1");
          window.setTimeout(() => {
            toast(
              "Dica: arraste o avatar pela barra azul para tirá-lo da frente."
            );
          }, 1500);
        }
      } catch {
        // Sem localStorage disponível
      }
    }
  }, []);

  const abrirAjustesSienna = useCallback(() => {
    const botaoSienna = document.querySelector<HTMLElement>(".asw-menu-btn");
    if (!botaoSienna) return;
    botaoSienna.click();
    window.setTimeout(() => {
      const menu = document.querySelector<HTMLElement>(".asw-menu");
      if (!menu || menu.parentElement?.style.display === "none") return;
      traduzirRotulosSienna();
      menu.querySelector<HTMLElement>(".asw-menu-close")?.focus();
    }, 60);
  }, []);

  return {
    siennaPronto,
    leitorParagrafoAtivo,
    definirLeitorParagrafo,
    alternarLeitorParagrafo,
    abrirLibras,
    abrirAjustesSienna,
  };
}
