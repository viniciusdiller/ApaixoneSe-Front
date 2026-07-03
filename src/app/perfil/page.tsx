"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  hospedagemApi,
  gastronomiaApi,
  servicoTuristaApi,
  usersApi,
  type Hospedagem,
  type Gastronomia,
  type ServicoTurista,
  type User as ApiUser,
} from "@/lib/api";
import { VisualizacaoModal, NegocioModal } from "@/components/perfil/VisualizacaoModal";
import { PlanoViagemList } from "@/components/planeje-sua-viagem";
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
  Eye,
  Mail,
  Save,
  CalendarDays,
  BadgeCheck,
} from "lucide-react";

interface PerfilFormState {
  nome: string;
  usuario: string;
  email: string;
  senha: string;
}

function parseApiErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof Error)) return fallback;

  try {
    const parsed = JSON.parse(error.message);
    if (Array.isArray(parsed?.message)) return parsed.message.join(" ");
    return parsed?.message || fallback;
  } catch {
    return error.message || fallback;
  }
}

function formatDateBr(iso?: string) {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("pt-BR");
}

function getStatusBadge(status?: string | null) {
  if (!status) return null;

  const statusUpper = status.toUpperCase();

  if (statusUpper === "APROVADO") {
    return (
      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
        Aprovado
      </span>
    );
  }

  if (statusUpper === "REJEITADO") {
    return (
      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-700">
        Rejeitado
      </span>
    );
  }

  return (
    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
      Pendente
    </span>
  );
}

export default function PerfilPage() {
  const { user, logout, isLoading, setCurrentUser } = useAuth();
  const router = useRouter();

  const [detalhesUsuario, setDetalhesUsuario] = useState<ApiUser | null>(null);
  const [loadingPerfil, setLoadingPerfil] = useState(false);
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);
  const [erroPerfil, setErroPerfil] = useState<string | null>(null);
  const [sucessoPerfil, setSucessoPerfil] = useState<string | null>(null);
  const [perfilForm, setPerfilForm] = useState<PerfilFormState>({
    nome: "",
    usuario: "",
    email: "",
    senha: "",
  });

  const [negocios, setNegocios] = useState<NegocioModal[]>([]);
  const [loadingEstabs, setLoadingEstabs] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState<NegocioModal | null>(null);

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;

    setLoadingPerfil(true);
    usersApi
      .getById(user.id)
      .then((dados) => {
        setDetalhesUsuario(dados);
        setPerfilForm({
          nome: dados.nome,
          usuario: dados.usuario,
          email: dados.email,
          senha: "",
        });
      })
      .catch(() => {
        const fallback: ApiUser = {
          id: user.id,
          nome: user.nome,
          usuario: user.usuario,
          email: "",
          perfil: user.perfil,
        };
        setDetalhesUsuario(fallback);
        setPerfilForm({
          nome: fallback.nome,
          usuario: fallback.usuario,
          email: fallback.email,
          senha: "",
        });
      })
      .finally(() => setLoadingPerfil(false));
  }, [user]);

  useEffect(() => {
    if (!user) return;

    setLoadingEstabs(true);
    setNegocios([]);

    Promise.all([
      hospedagemApi.getAll().catch(() => [] as Hospedagem[]),
      gastronomiaApi.getAll().catch(() => [] as Gastronomia[]),
      servicoTuristaApi.getAll().catch(() => [] as ServicoTurista[]),
    ])
      .then(([hospedagensData, gastronomiasData, servicosData]) => {
        const minhasHospedagens: NegocioModal[] = hospedagensData
          .filter((h) => String(h.usuarioId) === String(user.id))
          .map((h) => ({
            ...h,
            categoria: "hospedagem",
            tags: h.tags ?? undefined,
          }));

        const minhasGastronomias: NegocioModal[] = gastronomiasData
          .filter((g) => String(g.usuarioId) === String(user.id))
          .map((g) => ({ ...g, categoria: "gastronomia" }));

        const meusServicos: NegocioModal[] = servicosData
          .filter((s) => String(s.usuarioId) === String(user.id))
          .map((s) => ({ ...s, categoria: "servico-turista" }));

        setNegocios([
          ...minhasHospedagens,
          ...minhasGastronomias,
          ...meusServicos,
        ]);
      })
      .catch(console.error)
      .finally(() => setLoadingEstabs(false));
  }, [user]);

  function handleChangePerfil(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const { name, value } = event.target;
    setPerfilForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSalvarPerfil(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;

    setSalvandoPerfil(true);
    setErroPerfil(null);
    setSucessoPerfil(null);

    try {
      const payload: {
        nome: string;
        usuario: string;
        email: string;
        senha?: string;
      } = {
        nome: perfilForm.nome.trim(),
        usuario: perfilForm.usuario.trim(),
        email: perfilForm.email.trim(),
      };

      if (perfilForm.senha.trim()) {
        payload.senha = perfilForm.senha.trim();
      }

      const atualizado = await usersApi.update(user.id, payload);

      setDetalhesUsuario(atualizado);
      setCurrentUser({
        id: atualizado.id,
        nome: atualizado.nome,
        usuario: atualizado.usuario,
        perfil: atualizado.perfil,
      });
      setPerfilForm((prev) => ({ ...prev, senha: "" }));
      setSucessoPerfil("Dados atualizados com sucesso.");
    } catch (error) {
      setErroPerfil(parseApiErrorMessage(error, "Não foi possível salvar seu perfil."));
    } finally {
      setSalvandoPerfil(false);
    }
  }

  function handleLogout() {
    logout();
    router.push("/");
  }

  if (isLoading || !user || loadingPerfil || !detalhesUsuario) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const iniciais = detalhesUsuario.nome
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background pb-20 pt-28">
      <div className="container mx-auto max-w-5xl px-4">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para página inicial
        </Link>

        <div className="mb-8 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground shadow">
            {iniciais}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-foreground">
              {detalhesUsuario.nome}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">@{detalhesUsuario.usuario}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold">
              {detalhesUsuario.perfil === "ADMIN" && <ShieldCheck className="h-3.5 w-3.5 text-primary" />}
              {detalhesUsuario.perfil === "PARCEIRO" && <Store className="h-3.5 w-3.5 text-primary" />}
              {detalhesUsuario.perfil === "USUARIO" && <User className="h-3.5 w-3.5 text-primary" />}
              <span className="capitalize">{detalhesUsuario.perfil.toLowerCase()}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition hover:border-destructive hover:text-destructive"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>

        <section className="mb-6 rounded-2xl border border-border bg-card p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-bold uppercase tracking-wide text-foreground">
                Dados do Usuário
              </h2>
              <p className="text-sm text-muted-foreground">
                Mantenha suas informações pessoais atualizadas.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
              <BadgeCheck className="h-3.5 w-3.5 text-primary" /> Conta ativa
            </span>
          </div>

          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-border bg-background px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">ID</p>
              <p className="truncate text-xs font-medium text-foreground">{detalhesUsuario.id}</p>
            </div>
            <div className="rounded-xl border border-border bg-background px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Perfil</p>
              <p className="text-xs font-medium text-foreground">{detalhesUsuario.perfil}</p>
            </div>
            <div className="rounded-xl border border-border bg-background px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Cadastro</p>
              <p className="text-xs font-medium text-foreground">{formatDateBr(detalhesUsuario.createdAt)}</p>
            </div>
            <div className="rounded-xl border border-border bg-background px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Atualizado em</p>
              <p className="text-xs font-medium text-foreground">{formatDateBr(detalhesUsuario.updatedAt)}</p>
            </div>
          </div>

          <form onSubmit={handleSalvarPerfil} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <label htmlFor="nome" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Nome completo
              </label>
              <input
                id="nome"
                name="nome"
                value={perfilForm.nome}
                onChange={handleChangePerfil}
                required
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary"
              />
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="usuario" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Nome de usuário
              </label>
              <input
                id="usuario"
                name="usuario"
                value={perfilForm.usuario}
                onChange={handleChangePerfil}
                required
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary"
              />
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="email" className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Mail className="h-3 w-3" /> E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={perfilForm.email}
                onChange={handleChangePerfil}
                required
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary"
              />
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="senha" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Nova senha (opcional)
              </label>
              <input
                id="senha"
                name="senha"
                type="password"
                value={perfilForm.senha}
                onChange={handleChangePerfil}
                placeholder="Deixe em branco para manter a atual"
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary"
              />
            </div>

            <div className="sm:col-span-2 flex flex-col gap-2">
              {erroPerfil && (
                <p className="rounded-xl bg-rose-100 px-3 py-2 text-sm text-rose-700">{erroPerfil}</p>
              )}
              {sucessoPerfil && (
                <p className="rounded-xl bg-emerald-100 px-3 py-2 text-sm text-emerald-700">{sucessoPerfil}</p>
              )}

              <button
                type="submit"
                disabled={salvandoPerfil}
                className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-70"
              >
                {salvandoPerfil ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Salvar alterações
              </button>
            </div>
          </form>
        </section>

        {detalhesUsuario.perfil === "ADMIN" && (
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
              <ShieldCheck className="h-4 w-4" /> Ir para o Painel Admin
            </Link>
          </div>
        )}

        <section className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold uppercase tracking-wide text-foreground">
              Meus Estabelecimentos
            </h2>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {negocios.length} cadastrado{negocios.length !== 1 ? "s" : ""}
              </span>

              {(detalhesUsuario.perfil === "PARCEIRO" || detalhesUsuario.perfil === "USUARIO") && (
                <Link
                  href="/perfil/parcerias"
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  + Novo
                </Link>
              )}
            </div>
          </div>

          {loadingEstabs ? (
            <div className="flex justify-center rounded-2xl border border-border bg-card py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : negocios.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card py-16 text-center">
              <Building2 className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm font-medium text-foreground">Nenhum estabelecimento cadastrado</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Cadastre seu negócio para gerenciar tudo diretamente do seu perfil.
              </p>

              <Link
                href="/perfil/parcerias"
                className="mt-5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                Cadastrar estabelecimento
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {negocios.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition hover:shadow-md"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted">
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

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">{item.nome}</p>
                      <span className="rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        {item.categoria}
                      </span>
                      {getStatusBadge(item.status)}
                    </div>

                    {item.endereco && (
                      <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" /> {item.endereco}
                      </p>
                    )}
                    {item.telefone && (
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3 shrink-0" /> {item.telefone}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => setItemSelecionado(item)}
                      title="Visualizar"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition hover:border-primary hover:text-primary"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <Link
                      href={`/perfil/parcerias/${item.categoria}/${item.id}`}
                      title="Gerenciar"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition hover:border-primary hover:text-primary"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-bold uppercase tracking-wide text-foreground">
                Planos de Viagem
              </h2>
              <p className="text-sm text-muted-foreground">
                Crie, edite e acompanhe seus roteiros pessoais em um só lugar.
              </p>
            </div>
            <CalendarDays className="h-5 w-5 text-primary" />
          </div>

          <PlanoViagemList />
        </section>
      </div>

      {itemSelecionado && (
        <VisualizacaoModal
          item={itemSelecionado}
          onClose={() => setItemSelecionado(null)}
        />
      )}
    </div>
  );
}