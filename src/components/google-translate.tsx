// src/components/google-translate.tsx
"use client";

import Script from "next/script";
import { Globe, ChevronDown } from "lucide-react";
import { useEffect, useState, useRef } from "react";

const LANGUAGES = [
  { code: "pt", name: "Português", short: "PT" },
  { code: "en", name: "English", short: "EN" },
  { code: "es", name: "Español", short: "ES" },
];

export function GoogleTranslate() {
  const [currentLang, setCurrentLang] = useState("pt");
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const selectedLang = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  return (
    <div className="flex items-center">
      <div id="google_translate_element" className="absolute opacity-0 pointer-events-none -left-[9999px]"></div>

      <div className="relative notranslate" ref={dropdownRef}>
        
        {/* BOTÃO PRINCIPAL (ESTILO PÍLULA TRANSLÚCIDA) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center bg-primary-foreground/10 backdrop-blur-md rounded-full px-3 py-1.5 min-h-[32px] border border-primary-foreground/20 transition-all duration-300 hover:bg-primary-foreground/20 text-primary-foreground ${
            isMounted ? "opacity-100" : "opacity-0"
          }`}
        >
          <Globe className="w-4 h-4 mr-2 opacity-80" />
          <span className="text-xs font-medium mr-1">{selectedLang.short}</span>
          <ChevronDown className={`w-3 h-3 opacity-80 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {/* MENU DROPDOWN (ESTILO VIDRO) */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-36 bg-black/40 backdrop-blur-lg rounded-xl shadow-2xl border border-primary-foreground/10 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
            <div className="py-1 flex flex-col">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setIsOpen(false);
                    if (lang.code !== currentLang) changeLanguage(lang.code);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-primary-foreground/10 ${
                    currentLang === lang.code 
                      ? "text-primary-foreground font-bold bg-primary-foreground/20" 
                      : "text-primary-foreground/80 font-medium"
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