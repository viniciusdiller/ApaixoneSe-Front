import { Toaster } from "sonner";
import type { Metadata } from "next";
import "./globals.css";
import { SiteShell } from "@/components/site-shell";
import { AuthProvider } from "@/context/AuthContext";

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
        <Toaster richColors position="bottom-left" />
      </body>
    </html>
  );
}
