import type { Metadata } from "next";
import "./globals.css";
import { SiteShell } from "@/components/site-shell";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: {
    default: "Apaixone-se por Saquarema | Turismo em Saquarema/RJ",
    template: "%s | Apaixone-se por Saquarema",
  },
  description:
    "Descubra as belezas, praias, eventos, gastronomia e atrações turísticas de Saquarema-RJ. Planeje seu roteiro e apaixone-se pela cidade.",
  keywords: [
    "apaixonese",
    "apaixone-se",
    "apaixone-se por Saquarema",
    "Saquarema",
    "turismo Saquarema",
    "praias Saquarema",
    "o que fazer em Saquarema",
    "roteiros Saquarema",
    "hospedagem Saquarema",
    "eventos Saquarema",
    "gastronomia Saquarema",
    "lagoas Saquarema",
    "cultura Saquarema",
    "Rio de Janeiro turismo",
  ],
  authors: [{ name: "ApaixoneSe" }],
  creator: "ApaixoneSe",
  publisher: "ApaixoneSe",
  metadataBase: new URL("https://apaixonese.saquarema.rj.gov.br/"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://apaixonese.saquarema.rj.gov.br/",
    siteName: "Apaixone-se por Saquarema",
    title: "Apaixone-se por Saquarema | Turismo em Saquarema/RJ",
    description:
      "Descubra as belezas, praias, eventos, gastronomia e atrações turísticas de Saquarema, RJ.",
    images: [
      {
        url: "/apaixone-se.png",
        width: 1200,
        height: 630,
        alt: "Apaixone-se por Saquarema",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Apaixone-se por Saquarema | Turismo em Saquarema/RJ",
    description:
      "Descubra as belezas, praias, eventos e atrações de Saquarema/RJ.",
    images: ["/apaixone-se.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "HExQUr9hxreboilTa8K5g8titFvZV5WyTZ0zDejOaz4",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="canonical" href="https://apaixonese.saquarema.rj.gov.br/" />
      </head>
      <body>
        <AuthProvider>
          <Toaster position="top-right" />
          <SiteShell>{children}</SiteShell>
        </AuthProvider>
      </body>
    </html>
  );
}
