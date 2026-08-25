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
  BarChart3,
  X,
} from "lucide-react";
import { SessionTimer } from "./SessionTimer";
import { useAuth } from "@/context/AuthContext";

const links = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Cliques", href: "/admin/clicks", icon: BarChart3 },
  { label: "Usuários", href: "/admin/usuarios", icon: Users },
  {
    label: "Fique Por Dentro",
    href: "/admin/fique-por-dentro",
    icon: GalleryHorizontal,
  },
  { label: "Atividades", href: "/admin/atividades", icon: MapPin },
  { label: "Praias e Lagoas", href: "/admin/praias-lagoas", icon: Waves },
  { label: "História", href: "/admin/historia", icon: Palette },
  { label: "Eventos", href: "/admin/eventos", icon: Calendar },
  {
    label: "Evento Principal",
    href: "/admin/evento-principal",
    icon: Calendar,
  },
  { label: "Gastronomia", href: "/admin/gastronomia", icon: Utensils },
  { label: "Hospedagem", href: "/admin/hospedagem", icon: BedDouble },
  { label: "Serviços Turista", href: "/admin/servicos", icon: Wrench },
  { label: "Casa de Câmbio", href: "/admin/casa-de-cambio", icon: Banknote },
  {
    label: "Secretaria de Esporte, Lazer e Turismo",
    href: "/admin/secretaria-de-turismo",
    icon: Landmark,
  },
  { label: "CAT", href: "/admin/cat", icon: Tag },
];

interface AdminSidebarProps {
  /** Controla a gaveta no mobile (abaixo de md); ignorado em telas md+ onde a sidebar já fica sempre visível */
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function AdminSidebar({
  mobileOpen = false,
  onMobileClose,
}: AdminSidebarProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <>
      {/* Backdrop — só no mobile, quando a gaveta está aberta */}
      {mobileOpen && (
        <div
          aria-hidden="true"
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-shrink-0 flex-col border-r border-border transition-transform duration-300 md:sticky md:top-0 md:z-auto md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          // cor sólida legada (hex) como fallback: se o navegador não suportar
          // a sintaxe hsl(var() / alpha) do gradiente abaixo, essa declaração
          // separada garante que a sidebar não fique transparente/"vazando"
          backgroundColor: "#ffffff",
          backgroundImage:
            "linear-gradient(175deg, hsl(var(--primary) / 0.14) 0%, hsl(var(--card)) 30%)",
        }}
      >
        {/* reflexo de luz no topo */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 right-0 top-0 h-48 opacity-50"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% -10%, hsl(var(--primary) / 0.22) 0%, transparent 100%)",
          }}
        />

        {/* linha decorativa lateral direita (borda interna) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 inset-y-0 w-px"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, hsl(var(--primary) / 0.4) 40%, hsl(var(--accent) / 0.3) 70%, transparent 100%)",
          }}
        />

        {/* Brand */}
        <div className="relative flex items-center gap-3 border-b border-border px-5 py-5">
          {/* ícone com halo */}
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{
              background:
                "linear-gradient(135deg, hsl(var(--primary) / 0.2) 0%, hsl(var(--primary) / 0.08) 100%)",
              boxShadow:
                "0 0 0 1px hsl(var(--primary) / 0.25), 0 2px 8px hsl(var(--primary) / 0.15)",
            }}
          >
            <Waves className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <span className="font-display block text-sm font-bold uppercase tracking-widest text-primary">
              Apaixone-se
            </span>
            <span className="block text-[10px] uppercase tracking-widest text-muted-foreground">
              Painel Admin
            </span>
          </div>
          {/* Fechar gaveta — só no mobile */}
          <button
            type="button"
            onClick={onMobileClose}
            aria-label="Fechar menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-primary/10 hover:text-foreground md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
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
                    onClick={onMobileClose}
                    className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
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
                    {/* bolinha indicadora no item ativo */}
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute -left-3 top-1/2 h-4 w-1 -translate-y-1/2 rounded-r-full"
                        style={{
                          background: "hsl(var(--primary-foreground) / 0.5)",
                        }}
                      />
                    )}
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1">{label}</span>
                    {isActive && (
                      <ChevronRight className="h-3 w-3 opacity-70" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Cronômetro de sessão */}
        <SessionTimer />

        <div className="relative mt-auto pt-2">
          <button
            onClick={handleLogout}
            className="group flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-red-500 transition-all hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            <LogOut
              size={16}
              className="transition-transform group-hover:-translate-x-0.5"
            />
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
    </>
  );
}
