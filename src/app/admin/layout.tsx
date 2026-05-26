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
    // Permite a página de redirect do /admin/login
    if (isLoginPage) return;
    // Redireciona para /login se não autenticado ou não for ADMIN
    if (!user || user.perfil !== "ADMIN") {
      router.replace("/login");
    }
  }, [user, isLoading, isLoginPage, router]);

  if (isLoginPage) return <>{children}</>;
  if (isLoading || !user || user.perfil !== "ADMIN") return null;

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto max-w-7xl px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
