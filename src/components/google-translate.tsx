// src/components/google-translate.tsx
"use client";

import Script from "next/script";
import { Globe } from "lucide-react";
import { useEffect, useState } from "react";

export function GoogleTranslate() {
  // 1. Guarda o idioma atual no estado do React para o botão não "esquecer"
  const [currentLang, setCurrentLang] = useState("pt");

  // 2. Assim que a página carrega, lê o cookie para saber em qual idioma o site está
  useEffect(() => {
    const cookies = document.cookie.split("; ");
    const googtransCookie = cookies.find((row) => row.startsWith("googtrans="));
    
    if (googtransCookie) {
      const value = googtransCookie.split("=")[1];
      const lang = value.split("/")[2];
      if (lang) {
        setCurrentLang(lang);
      }
    }
  }, []);

  const changeLanguage = (lang: string) => {
    if (lang === 'pt') {
      // 3. LIMPEZA NUCLEAR: Apaga o idioma de todas as memórias do navegador
      const domain = window.location.hostname;
      
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${domain};`; // Apaga o cookie zumbi
      
      window.localStorage.removeItem('googtrans');
      window.sessionStorage.removeItem('googtrans');
    } else {
      // Se for EN ou ES, apenas salva a escolha normalmente
      const cookieValue = `/pt/${lang}`;
      document.cookie = `googtrans=${cookieValue}; path=/;`;
      document.cookie = `googtrans=${cookieValue}; path=/; domain=${window.location.hostname};`;
    }

    // 4. Recarrega a página
    window.location.reload();
  };

  return (
    <div className="flex items-center">
      {/* WIDGET DO GOOGLE (Jogado para fora da tela, mas ainda "vivo" no código) */}
      <div id="google_translate_element" className="absolute opacity-0 pointer-events-none -left-[9999px]"></div>

      {/* NOSSO BOTÃO CUSTOMIZADO E RESPONSIVO */}
      <div className="relative flex items-center bg-primary-foreground/10 rounded-full px-3 py-1.5 min-h-[32px] border border-primary-foreground/10 transition-colors hover:bg-primary-foreground/20">
        <Globe className="w-4 h-4 text-primary-foreground mr-2 opacity-80" />
        
        <select
          value={currentLang} // <-- Mudou de defaultValue para value={currentLang}
          onChange={(e) => changeLanguage(e.target.value)}
          className="bg-transparent text-primary-foreground text-xs font-medium outline-none cursor-pointer appearance-none pr-5"
          aria-label="Escolher idioma"
        >
          <option value="pt" className="text-black bg-white">PT</option>
          <option value="en" className="text-black bg-white">EN</option>
          <option value="es" className="text-black bg-white">ES</option>
        </select>
        
        {/* Setinha customizada do nosso dropdown */}
        <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
          <svg className="w-3 h-3 text-primary-foreground opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </div>

      {/* SCRIPTS DO GOOGLE TRANSLATE */}
      <Script
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="lazyOnload"
      />
      <Script id="google-translate-init" strategy="lazyOnload">
        {`
          function googleTranslateElementInit() {
            new window.google.translate.TranslateElement({
              pageLanguage: 'pt',
              includedLanguages: 'en,es,pt',
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: false,
            }, 'google_translate_element');
          }
        `}
      </Script>
    </div>
  );
}