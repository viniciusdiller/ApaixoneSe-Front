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
    <div className="flex min-h-screen" style={{ background: "hsl(var(--background))" }}>
      {/* Pattern de fundo: grid pontilhado sutil em SVG data-uri */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ccircle cx='1' cy='1' r='1' fill='%23000' fill-opacity='0.045'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      {/* Mancha de luz ambiente no canto superior direito */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed right-0 top-0 z-0 h-[520px] w-[520px] -translate-y-1/4 translate-x-1/4"
        style={{
          background:
            "radial-gradient(ellipse at center, hsl(var(--primary) / 0.07) 0%, transparent 70%)",
        }}
      />

      <AdminSidebar />
      <main className="relative z-10 flex-1 overflow-auto">
        <div className="container mx-auto max-w-7xl px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
