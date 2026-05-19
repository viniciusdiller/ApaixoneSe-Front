// src/components/google-translate.tsx
"use client";

import Script from "next/script";

export function GoogleTranslate() {
  return (
    <>
      {/* Esta é a div onde o botão do Google vai ser renderizado */}
      <div id="google_translate_element" className="flex items-center justify-center min-h-[32px]"></div>

      {/* Script principal do Google Translate */}
      <Script
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="lazyOnload" // Carrega apenas depois que o site principal já renderizou
      />

      {/* Script de inicialização com as configurações */}
      <Script id="google-translate-init" strategy="lazyOnload">
        {`
          function googleTranslateElementInit() {
            new window.google.translate.TranslateElement({
              pageLanguage: 'pt', // Idioma original do seu site
              includedLanguages: 'en,es,pt', // Idiomas que aparecerão na lista
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
            }, 'google_translate_element');
          }
        `}
      </Script>
    </>
  );
}