import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { AuthProvider } from "@/context/AuthContext";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Apaixone-se por Saquarema",
  description: "Descubra as belezas, eventos e atrações de Saquarema/RJ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          <SiteShell>{children}</SiteShell>
        </AuthProvider>
      </body>
    </html>
  );
}
