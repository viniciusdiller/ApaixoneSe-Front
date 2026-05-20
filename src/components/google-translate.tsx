"use client";

import Script from "next/script";
import { Globe, ChevronDown } from "lucide-react";
import { useEffect, useState, useRef } from "react";

const LANGUAGES = [
  { code: "pt", name: "Português", short: "pt" },
  { code: "en", name: "English", short: "en" },
  { code: "es", name: "Español", short: "es" },
];

export function GoogleTranslate() {
  const [currentLang, setCurrentLang] = useState("pt");
  const [isMounted, setIsMounted] = useState(false);
  
  // Novos estados para controlar o nosso menu customizado
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Lê os cookies ao carregar a página
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
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLanguage = (lang: string) => {
    if (lang === 'pt') {
      const domain = window.location.hostname;
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${domain};`; 
      
      window.localStorage.removeItem('googtrans');
      window.sessionStorage.removeItem('googtrans');
    } else {
      const cookieValue = `/pt/${lang}`;
      document.cookie = `googtrans=${cookieValue}; path=/;`;
      document.cookie = `googtrans=${cookieValue}; path=/; domain=${window.location.hostname};`;
    }
    window.location.reload();
  };

  // Encontra o idioma atualmente selecionado para mostrar no botão
  const selectedLang = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  return (
    <div className="flex items-center">
      <div id="google_translate_element" className="absolute opacity-0 pointer-events-none -left-[9999px]"></div>

      <div className="relative notranslate" ref={dropdownRef}>
        
        {/* O BOTÃO QUE FICA NA NAVBAR */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center bg-primary-foreground/10 rounded-full px-3 py-1.5 min-h-[32px] border border-primary-foreground/10 transition-all duration-300 hover:bg-primary-foreground/20 text-primary-foreground ${
            isMounted ? "opacity-100" : "opacity-0"
          }`}
          aria-label="Escolher idioma"
          aria-expanded={isOpen}
        >
          <Globe className="w-4 h-4 mr-2 opacity-80" />
          <span className="text-xs font-medium mr-1">{selectedLang.short}</span>
          <ChevronDown className={`w-3 h-3 opacity-80 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-36 bg-white rounded-xl shadow-xl ring-1 ring-black/5 overflow-hidden z-50 transition-all origin-top-right">
            <div className="py-1 flex flex-col">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setIsOpen(false);
                    // Só recarrega se clicar num idioma diferente do atual
                    if (lang.code !== currentLang) changeLanguage(lang.code);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-gray-100 ${
                    currentLang === lang.code 
                      ? "text-[#005c8a] font-bold bg-blue-50/50" // Cor de destaque para o idioma atual
                      : "text-gray-700 font-medium"
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <Script
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
      <Script id="google-translate-init" strategy="afterInteractive">
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