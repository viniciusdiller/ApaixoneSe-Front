"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

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
    <div className="relative flex min-h-screen bg-background">
      {/* ── Dot-grid pattern ──────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28'%3E%3Ccircle cx='1' cy='1' r='1.1' fill='%230d3d40' fill-opacity='0.07'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
        }}
      />

      {/* ── Mancha de luz — canto superior direito ───────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed right-0 top-0 z-0"
        style={{
          width: "560px",
          height: "480px",
          transform: "translate(30%, -30%)",
          background:
            "radial-gradient(ellipse at center, hsla(179, 100%, 22%, 0.09) 0%, transparent 70%)",
        }}
      />

      {/* ── Mancha de luz — canto inferior (após sidebar) ────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed bottom-0 left-64 z-0"
        style={{
          width: "420px",
          height: "340px",
          transform: "translate(-20%, 30%)",
          background:
            "radial-gradient(ellipse at center, hsla(192, 100%, 41%, 0.06) 0%, transparent 70%)",
        }}
      />

      <AdminSidebar />
      <main className="relative z-10 flex-1 overflow-auto">
        <div className="container mx-auto max-w-7xl px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
