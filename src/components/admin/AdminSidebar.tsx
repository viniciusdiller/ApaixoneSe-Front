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
  Banknote,
  Landmark,
  GalleryHorizontal,
  Palette,
} from "lucide-react";
import { SessionTimer } from "./SessionTimer";
import { useAuth } from "@/context/AuthContext";

const links = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Usuários", href: "/admin/usuarios", icon: Users },
  { label: "Fique Por Dentro", href: "/admin/fique-por-dentro", icon: GalleryHorizontal },
  { label: "Atividades", href: "/admin/atividades", icon: MapPin },
  { label: "Praias e Lagoas", href: "/admin/praias-lagoas", icon: Waves },
  { label: "Cultura", href: "/admin/cultura", icon: Palette },
  { label: "Eventos", href: "/admin/eventos", icon: Calendar },
  { label: "Evento Principal", href: "/admin/evento-principal", icon: Calendar },
  { label: "Gastronomia", href: "/admin/gastronomia", icon: Utensils },
  { label: "Hospedagem", href: "/admin/hospedagem", icon: BedDouble },
  { label: "Serviços Turista", href: "/admin/servicos", icon: Wrench },
  { label: "Casa de Câmbio", href: "/admin/casa-de-cambio", icon: Banknote },
  { label: "Secretaria de Turismo", href: "/admin/secretaria-de-turismo", icon: Landmark },
  { label: "Planos de Viagem", href: "/admin/planos-de-viagem", icon: BookOpen },
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
    <aside
      className="sticky top-0 flex h-screen w-64 flex-shrink-0 flex-col border-r border-border"
      style={{
        // gradiente vertical suave do primary escuro para o fundo do card
        background:
          "linear-gradient(175deg, hsl(var(--primary) / 0.12) 0%, hsl(var(--card)) 28%)",
      }}
    >
      {/* reflexo de luz no topo da sidebar */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 right-0 top-0 h-40 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, hsl(var(--primary) / 0.18) 0%, transparent 100%)",
        }}
      />

      {/* Brand */}
      <div className="relative flex items-center gap-2 border-b border-border px-5 py-5">
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
      <nav className="relative flex-1 overflow-y-auto px-3 py-4">
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
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                  }`}
                  style={
                    isActive
                      ? {
                          background:
                            "linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.85) 100%)",
                          boxShadow:
                            "0 2px 8px hsl(var(--primary) / 0.35), inset 0 1px 0 hsl(var(--primary-foreground) / 0.12)",
                        }
                      : undefined
                  }
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight className="h-3 w-3 opacity-70" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Cronômetro de sessão */}
      <SessionTimer />

      <div className="relative mt-auto pt-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          <LogOut size={20} />
          Sair
        </button>
      </div>

      {/* Footer link */}
      <div className="relative border-t border-border p-4">
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
