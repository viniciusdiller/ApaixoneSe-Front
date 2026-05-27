"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Utensils,
  BedDouble,
  Wrench,
  MapPin,
  BookOpen,
  Tag,
  Waves,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { SessionTimer } from "./SessionTimer";
import { useAuth } from "@/context/AuthContext";
const links = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Usuários", href: "/admin/usuarios", icon: Users },
  { label: "Atividades", href: "/admin/atividades", icon: MapPin },
  { label: "Eventos", href: "/admin/eventos", icon: Calendar },
  { label: "Gastronomia", href: "/admin/gastronomia", icon: Utensils },
  { label: "Hospedagem", href: "/admin/hospedagem", icon: BedDouble },
  { label: "Serviços Turista", href: "/admin/servicos", icon: Wrench },
  { label: "Planos de Viagem", href: "/admin/planos", icon: BookOpen },
  { label: "CAT", href: "/admin/cat", icon: Tag },
];

export function AdminSidebar() {
  const router = useRouter();
  const { logout } = useAuth();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <aside className="sticky top-0 flex h-screen w-64 flex-shrink-0 flex-col border-r border-border bg-card">
      {/* Brand */}
      <div className="flex items-center gap-2 border-b border-border px-5 py-5">
        <Waves className="h-7 w-7 text-primary" />
        <div>
          <span className="font-display block text-sm font-bold uppercase tracking-widest text-primary">
            Apaixone-se
          </span>
          <span className="block text-[10px] uppercase tracking-widest text-muted-foreground">
            Painel Admin
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {links.map(({ label, href, icon: Icon }) => {
            const isActive =
              href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight className="h-3 w-3 opacity-60" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Cronômetro de sessão */}
      <SessionTimer />

      <div className="mt-auto pt-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          <LogOut size={20} />
          Sair
        </button>
      </div>

      {/* Footer link */}
      <div className="border-t border-border p-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <Waves className="h-3.5 w-3.5" />
          Ver site público
        </Link>
      </div>
    </aside>
  );
}
