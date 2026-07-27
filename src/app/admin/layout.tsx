"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

// SVG dot-grid como data-uri — bolinhas 1px, tile 28×28
const DOT_GRID =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28'%3E%3Ccircle cx='1' cy='1' r='1.1' fill='%230d3d40' fill-opacity='0.065'/%3E%3C/svg%3E\")";

// Combina o pattern com dois blobs de luz ambiente num único background multi-layer
const MAIN_BG = [
  // blob superior direito — primary teal
  "radial-gradient(ellipse 560px 480px at calc(100% + 160px) -120px, hsla(179,100%,22%,0.10) 0%, transparent 70%)",
  // blob inferior esquerdo — secondary cyan
  "radial-gradient(ellipse 420px 340px at -80px calc(100% + 100px), hsla(192,100%,41%,0.07) 0%, transparent 70%)",
  // dot-grid por baixo de tudo
  DOT_GRID,
].join(", ");

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoading) return;
    if (isLoginPage) return;
    if (!user || user.perfil !== "ADMIN") {
      router.replace("/login");
    }
  }, [user, isLoading, isLoginPage, router]);

  if (isLoginPage) return <>{children}</>;
  if (isLoading || !user || user.perfil !== "ADMIN") return null;

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main
        className="flex-1 overflow-auto"
        style={{ backgroundImage: MAIN_BG }}
      >
        <div className="container mx-auto max-w-7xl px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
