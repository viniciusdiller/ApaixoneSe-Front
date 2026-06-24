"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { hospedagemApi, gastronomiaApi } from "@/lib/api"; // APIs importadas
import {
  User,
  Building2,
  Pencil,
  LogOut,
  ShieldCheck,
  Store,
  Loader2,
  MapPin,
  Phone,
} from "lucide-react";

// 1. Tipo unificado usando "categoria"
type Negocio = {
  id: string;
  nome: string;
  endereco?: string;
  telefone?: string;
  logoUrl?: string;
  categoria: "hospedagem" | "gastronomia" | "servico"; // Limpo e escalável!
};

export default function PerfilPage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [loadingEstabs, setLoadingEstabs] = useState(false);

  // Redireciona se não logado
  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [user, isLoading, router]);

  // Carrega estabelecimentos se for PARCEIRO
  useEffect(() => {
    if (user?.perfil !== "PARCEIRO") return;
    
    setLoadingEstabs(true);
    
    // Busca as Hospedagens e as Gastronomias ao mesmo tempo
    Promise.all([
      hospedagemApi.getAll().catch(() => []),
      gastronomiaApi.getAll().catch(() => [])
    ])
      .then(([hospedagensData, gastronomiasData]) => {
        // Filtra e injeta a categoria
        const minhasHospedagens: Negocio[] = hospedagensData
          .filter((h: any) => String(h.usuarioId) === String(user.id))
          .map((h: any) => ({ ...h, categoria: "hospedagem" }));

        // Filtra e injeta a categoria
        const minhasGastronomias: Negocio[] = gastronomiasData
          .filter((g: any) => String(g.usuarioId) === String(user.id))
          .map((g: any) => ({ ...g, categoria: "gastronomia" }));

        // Junta tudo numa lista só
        setNegocios([...minhasHospedagens, ...minhasGastronomias]);
      })
      .catch(console.error)
      .finally(() => setLoadingEstabs(false));
  }, [user]);

  function handleLogout() {
    logout();
    router.push("/");
  }

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const iniciais = user.nome
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background pb-20 pt-28">
      <div className="container mx-auto max-w-3xl px-4">
        {/* Cabeçalho do perfil */}
        <div className="mb-8 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground shadow">
            {iniciais}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-foreground">
              {user.nome}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              @{user.usuario}
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold">
              {user.perfil === "ADMIN" && (
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              )}
              {user.perfil === "PARCEIRO" && (
                <Store className="h-3.5 w-3.5 text-primary" />
              )}
              {user.perfil === "USUARIO" && (
                <User className="h-3.5 w-3.5 text-primary" />
              )}
              <span className="capitalize">{user.perfil.toLowerCase()}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition hover:border-destructive hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>

        {/* ADMIN: botão painel */}
        {user.perfil === "ADMIN" && (
          <div className="mb-6 rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-1 font-display text-lg font-bold uppercase tracking-wide text-foreground">
              Acesso de Administrador
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Você tem acesso completo ao painel de administração do site.
            </p>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              <ShieldCheck className="h-4 w-4" />
              Ir para o Painel Admin
            </Link>
          </div>
        )}

        {/* PARCEIRO: estabelecimentos */}
        {user.perfil === "PARCEIRO" && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold uppercase tracking-wide text-foreground">
                Minhas Parcerias
              </h2>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {negocios.length} cadastrado{negocios.length !== 1 ? "s" : ""}
                </span>
                <Link
                  href="/perfil/parcerias"
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  + Novo
                </Link>
              </div>
            </div>

            {loadingEstabs ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : negocios.length === 0 ? (
              <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card py-16 text-center">
                <Building2 className="mb-3 h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm font-medium text-foreground">
                  Nenhum negócio cadastrado
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Suas Parcerias aparecerão aqui.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {negocios.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition hover:shadow-md"
                  >
                    {/* Thumb */}
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted">
                      {item.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL ?? ""}${item.logoUrl}`}
                          alt={item.nome}
                          className="h-full w-full object-contain p-1"
                        />
                      ) : (
                        <span className="text-lg font-bold text-muted-foreground">
                          {item.nome.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {item.nome}
                        </p>
                        <span className="rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                          {item.categoria}
                        </span>
                      </div>
                      
                      {item.endereco && (
                        <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {item.endereco}
                        </p>
                      )}
                      {item.telefone && (
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3 shrink-0" />
                          {item.telefone}
                        </p>
                      )}
                    </div>

                    {/* Ações */}
                    <div className="flex shrink-0 items-center gap-2">
                      <Link
                        // O botão leva para a rota de edição usando a categoria
                        href={`/perfil/parcerias/${item.categoria}/${item.id}`}
                        title="Gerenciar"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:border-primary hover:text-primary"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* USUARIO: mensagem simples */}
        {user.perfil === "USUARIO" && (
          <div className="flex flex-col gap-10"> {/* Aumentei o gap para separar bem as duas áreas */}
            
            {/* Cartão de Boas-vindas (Mantido no quadrado branco) */}
            <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
              <User className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="font-medium text-foreground text-lg">
                Bem-vindo, {user.nome.split(" ")[0]}!
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Explore Saquarema e aproveite tudo que a cidade tem a oferecer.
              </p>
              <Link
                href="/"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                Explorar o site
              </Link>
            </div>
            
            {/* CTA para virar Parceiro (Solto na página, sem borda, verde em destaque) */}
            <div className="px-4 py-2 text-center">
              <Store className="mx-auto mb-4 h-12 w-12 text-primary/80" />
              <p className="text-xl font-bold text-primary">
                Tem um negócio em Saquarema?
              </p>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                Cadastre seu estabelecimento ou serviço e torne-se um Parceiro oficial da plataforma!
              </p>
              <Link
                href="/perfil/parcerias"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:scale-105 active:scale-95"
              >
                Cadastrar Negócio
              </Link>
            </div>

          </div> 
        )}
      </div>
    </div>
  );
}