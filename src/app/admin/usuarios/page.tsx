"use client";

import { confirmAction, notify } from "@/lib/feedback";

import { useEffect, useState, useMemo } from "react";
import {
  usersApi,
  gastronomiaApi,
  hospedagemApi,
  servicoTuristaApi,
  planoViagemApi,
} from "@/lib/api";
import type {
  User,
  Gastronomia,
  Hospedagem,
  ServicoTurista,
  PlanoViagem,
  Perfil,
} from "@/lib/api";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminFormField } from "@/components/admin/AdminFormField";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { LoadingGrid } from "@/components/ui/LoadingGrid";
import {
  Eye,
  Pencil,
  UserCircle,
  UtensilsCrossed,
  BedDouble,
  Briefcase,
  Map,
  X,
  UserPlus,
  CheckCircle2,
  XCircle,
  Search,
} from "lucide-react";
import { maskPersonName } from "@/lib/masks";

const PAGE_SIZE = 10;

// ── tipos ──────────────────────────────────────────────────────────────────
interface EditForm {
  nome: string;
  usuario: string;
  email: string;
  perfil: Perfil;
  senha: string;
  active: boolean;
}

interface CreateForm {
  nome: string;
  usuario: string;
  email: string;
  perfil: Perfil;
  senha: string;
}

interface UserDetails {
  user: User;
  gastronomias: Gastronomia[];
  hospedagens: Hospedagem[];
  servicos: ServicoTurista[];
  planos: PlanoViagem[];
}

const PERFIS: Perfil[] = ["USUARIO", "PARCEIRO", "ADMIN"];

const PERFIL_BADGE: Record<Perfil, string> = {
  USUARIO: "bg-blue-100 text-blue-800",
  PARCEIRO: "bg-amber-100 text-amber-800",
  ADMIN: "bg-rose-100 text-rose-800",
};

const EMPTY_CREATE: CreateForm = {
  nome: "",
  usuario: "",
  email: "",
  perfil: "USUARIO",
  senha: "",
};

// ── helpers ────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    APROVADO: "bg-green-100 text-green-800",
    PENDENTE: "bg-yellow-100 text-yellow-800",
    REJEITADO: "bg-red-100 text-red-800",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${map[status] ?? "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}

function EmailVerificadoBadge({ userId, active, onToggle }: { userId: string; active: boolean; onToggle: (id: string, next: boolean) => void }) {
  return (
    <button
      onClick={() => onToggle(userId, !active)}
      title={active ? "Verificado — clique para revogar" : "Não verificado — clique para ativar"}
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium transition hover:opacity-80 ${
        active
          ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
          : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
      }`}
    >
      {active ? <><CheckCircle2 size={12} /> Sim</> : <><XCircle size={12} /> Não</>}
    </button>
  );
}

// ── componente principal ───────────────────────────────────────────────────
export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // modal criar
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateForm>(EMPTY_CREATE);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // modal editar
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    nome: "", usuario: "", email: "", perfil: "USUARIO", senha: "", active: false,
  });
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");

  // modal detalhes
  const [details, setDetails] = useState<UserDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // ── load ──
  const load = () => {
    setLoading(true);
    usersApi.getAll().then(setUsers).finally(() => setLoading(false));
  };
  useEffect(load, []);

  // ── filtro + paginação (ambos via useMemo) ──
  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.nome.toLowerCase().includes(q) ||
        u.usuario.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
    );
  }, [users, search]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));

  // volta para p.1 sempre que a busca mudar
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const pagedUsers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, page]);

  // ── toggle active ──
  const handleToggleActive = async (id: string, next: boolean) => {
    try {
      const updated = await usersApi.setActive(id, next);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, active: updated.active } : u)));
    } catch (err) {
      console.error("Erro ao atualizar status do usuário:", err);
    }
  };

  // ── criar usuário ──
  const handleCreate = async () => {
    setCreating(true);
    setCreateError("");
    try {
      await usersApi.register({
        nome: createForm.nome,
        usuario: createForm.usuario,
        email: createForm.email,
        perfil: createForm.perfil,
        senha: createForm.senha,
      });
      setCreateOpen(false);
      setCreateForm(EMPTY_CREATE);
      load();
    } catch (err: unknown) {
      let msg = "Erro ao criar usuário.";
      try {
        const parsed = JSON.parse((err as Error).message);
        msg = Array.isArray(parsed.message) ? parsed.message.join(" ") : (parsed.message ?? msg);
      } catch {}
      setCreateError(msg);
    } finally {
      setCreating(false);
    }
  };

  // ── abrir edição ──
  const openEdit = (user: User) => {
    setEditUser(user);
    setEditForm({ nome: user.nome, usuario: user.usuario, email: user.email, perfil: user.perfil, senha: "", active: user.active ?? false });
    setEditError("");
  };

  // ── salvar edição ──
  const handleSave = async () => {
    if (!editUser) return;
    setSaving(true);
    setEditError("");
    try {
      const payload: Record<string, unknown> = {
        nome: editForm.nome,
        usuario: editForm.usuario,
        email: editForm.email,
        perfil: editForm.perfil,
        active: editForm.active,
      };
      if (editForm.senha.trim()) payload.senha = editForm.senha.trim();
      await usersApi.update(editUser.id, payload);
      setEditUser(null);
      load();
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : "Erro ao salvar alterações");
    } finally {
      setSaving(false);
    }
  };

  // ── excluir ──
  const handleDelete = async (user: User) => {
    if (!(await confirmAction(`Excluir usuário "${user.nome}"?`))) return;
    await usersApi.delete(user.id);
    load();
  };

  // ── abrir detalhes ──
  const openDetails = async (user: User) => {
    setDetailsLoading(true);
    setDetails({ user, gastronomias: [], hospedagens: [], servicos: [], planos: [] });
    try {
      const [allGast, allHosp, allServ, allPlanos] = await Promise.all([
        gastronomiaApi.getAll(),
        hospedagemApi.getAll(),
        servicoTuristaApi.getAll(),
        planoViagemApi.getAll(),
      ]);
      setDetails({
        user,
        gastronomias: allGast.filter((g) => g.usuarioId === user.id),
        hospedagens: allHosp.filter((h) => h.usuarioId === user.id),
        servicos: allServ.filter((s) => s.usuarioId === user.id),
        planos: allPlanos.filter((p) => p.usuarioId === user.id),
      });
    } catch {
      // mantém o que foi carregado parcialmente
    } finally {
      setDetailsLoading(false);
    }
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* cabeçalho */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-widest text-foreground sm:text-3xl">
            Usuários
          </h1>
          <p className="text-sm text-muted-foreground">
            {filteredUsers.length === users.length
              ? `${users.length} registros`
              : `${filteredUsers.length} de ${users.length} registros`}
            {totalPages > 1 && ` — página ${page} de ${totalPages}`}
          </p>
        </div>
        <button
          onClick={() => { setCreateForm(EMPTY_CREATE); setCreateError(""); setCreateOpen(true); }}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 active:scale-95"
        >
          <UserPlus size={16} />
          Novo Usuário
        </button>
      </div>

      {/* barra de pesquisa */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          type="search"
          placeholder="Pesquisar por nome, usuário ou e-mail…"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {search && (
          <button
            type="button"
            onClick={() => handleSearchChange("")}
            className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded text-muted-foreground transition hover:text-foreground"
            aria-label="Limpar pesquisa"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* tabela */}
      {loading ? (
        <LoadingGrid count={3} />
      ) : (
        <>
          <AdminTable<User>
            data={pagedUsers}
            columns={[
              { key: "usuario", label: "Login" },
              { key: "nome", label: "Nome" },
              { key: "email", label: "E-mail" },
              {
                key: "perfil",
                label: "Perfil",
                render: (_, row) => (
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${PERFIL_BADGE[row.perfil] ?? ""}`}>
                    {row.perfil}
                  </span>
                ),
              },
              {
              key: "active",
              label: "Email verificado",
              render: (_, row) => (
                <EmailVerificadoBadge
                  userId={row.id}
                  active={row.active ?? false}
                  onToggle={handleToggleActive}
                />
              ),
            },
              {
                key: "createdAt",
                label: "Criado em",
                render: (_, row) =>
                  row.createdAt ? new Date(row.createdAt).toLocaleDateString("pt-BR") : "—",
              },
            ]}
            extraActions={(row) => (
              <>
                <button onClick={() => openDetails(row)} title="Ver detalhes" aria-label="Ver detalhes" className="flex h-9 w-9 items-center justify-center rounded text-muted-foreground transition hover:bg-muted hover:text-primary">
                  <Eye size={16} />
                </button>
                <button onClick={() => openEdit(row)} title="Editar" aria-label="Editar" className="flex h-9 w-9 items-center justify-center rounded text-muted-foreground transition hover:bg-muted hover:text-primary">
                  <Pencil size={16} />
                </button>
              </>
            )}
            onDelete={handleDelete}
          />

          <AdminPagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}

      {/* ── Modal Criar ───────────────────────────────────────────────── */}
      <AdminModal
        open={createOpen}
        title="Novo Usuário"
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        submitLabel={creating ? "Criando…" : "Criar Usuário"}
      >
        <div className="grid gap-4">
          {createError && (
            <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
              {createError}
            </p>
          )}
          <AdminFormField label="Nome completo" value={createForm.nome} onChange={(v) => setCreateForm((f) => ({ ...f, nome: v }))} mask={maskPersonName} required />
          <AdminFormField label="Nome de usuário (login)" value={createForm.usuario} onChange={(v) => setCreateForm((f) => ({ ...f, usuario: v }))} required />
          <AdminFormField label="E-mail" type="email" value={createForm.email} onChange={(v) => setCreateForm((f) => ({ ...f, email: v }))} required />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-foreground">Perfil</label>
            <select
              value={createForm.perfil}
              onChange={(e) => setCreateForm((f) => ({ ...f, perfil: e.target.value as Perfil }))}
              className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {PERFIS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <AdminFormField label="Senha" type="password" value={createForm.senha} onChange={(v) => setCreateForm((f) => ({ ...f, senha: v }))} required />
        </div>
      </AdminModal>

      {/* ── Modal Edição ──────────────────────────────────────────────── */}
      <AdminModal
        open={!!editUser}
        title={`Editar usuário — ${editUser?.nome}`}
        onClose={() => setEditUser(null)}
        onSubmit={handleSave}
        submitLabel={saving ? "Salvando…" : "Salvar alterações"}
      >
        <div className="grid gap-4">
          {editError && (
            <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{editError}</p>
          )}
          <AdminFormField label="Nome completo" value={editForm.nome} onChange={(v) => setEditForm((f) => ({ ...f, nome: v }))} mask={maskPersonName} required />
          <AdminFormField label="Nome de usuário (login)" value={editForm.usuario} onChange={(v) => setEditForm((f) => ({ ...f, usuario: v }))} required />
          <AdminFormField label="E-mail" type="email" value={editForm.email} onChange={(v) => setEditForm((f) => ({ ...f, email: v }))} required />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-foreground">Perfil</label>
            <select
              value={editForm.perfil}
              onChange={(e) => setEditForm((f) => ({ ...f, perfil: e.target.value as Perfil }))}
              className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {PERFIS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* ── Email Verificado (toggle) ── */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-4 py-3">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">Email verificado</span>
              <span className="text-xs text-muted-foreground">
                {editForm.active ? "Conta ativa — e-mail confirmado" : "Conta inativa — e-mail não confirmado"}
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={editForm.active}
              onClick={() => setEditForm((f) => ({ ...f, active: !f.active }))}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                editForm.active ? "bg-green-500" : "bg-muted-foreground/30"
              }`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${editForm.active ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>

          <AdminFormField label="Nova senha (deixe vazio para não alterar)" type="password" value={editForm.senha || ""} onChange={(v) => setEditForm((f) => ({ ...f, senha: v || "" }))} />
        </div>
      </AdminModal>

      {/* ── Modal Detalhes ────────────────────────────────────────────── */}
      {details && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl shadow-2xl"
            style={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
          >
            <div className="flex flex-wrap items-center gap-3 px-4 py-4 sm:px-6" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
              <UserCircle size={24} className="text-primary" />
              <div className="min-w-0 flex-1">
                <h2 className="font-display truncate text-xl font-bold uppercase tracking-widest text-foreground">{details.user.nome}</h2>
                <p className="truncate text-xs text-muted-foreground">@{details.user.usuario} · {details.user.email}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PERFIL_BADGE[details.user.perfil]}`}>{details.user.perfil}</span>
              <button onClick={() => setDetails(null)} aria-label="Fechar" className="ml-2 flex h-9 w-9 items-center justify-center rounded text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4 sm:px-6">
              {detailsLoading ? (
                <p className="text-sm text-muted-foreground">Carregando…</p>
              ) : (
                <>
                  <Section icon={<UtensilsCrossed size={16} />} title="Gastronomia" count={details.gastronomias.length}>
                    {details.gastronomias.length === 0 ? <Empty /> : details.gastronomias.map((g) => <EstabelecimentoCard key={g.id} nome={g.nome} sub={g.endereco} status={g.status} logo={g.logoUrl} />)}
                  </Section>
                  <Section icon={<BedDouble size={16} />} title="Hospedagem" count={details.hospedagens.length}>
                    {details.hospedagens.length === 0 ? <Empty /> : details.hospedagens.map((h) => <EstabelecimentoCard key={h.id} nome={h.nome} sub={h.endereco} status={h.status} logo={h.logoUrl} />)}
                  </Section>
                  <Section icon={<Briefcase size={16} />} title="Serviços Turísticos" count={details.servicos.length}>
                    {details.servicos.length === 0 ? <Empty /> : details.servicos.map((s) => <EstabelecimentoCard key={s.id} nome={s.nome} sub={s.tipo} status={s.status} logo={s.logoUrl ?? undefined} />)}
                  </Section>
                  <Section icon={<Map size={16} />} title="Planos de Viagem" count={details.planos.length}>
                    {details.planos.length === 0 ? <Empty /> : (
                      <div className="space-y-2">
                        {details.planos.map((p) => (
                          <div key={p.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: "hsl(var(--muted))", border: "1px solid hsl(var(--border))" }}>
                            <span className="min-w-0 truncate font-medium text-foreground">{p.titulo}</span>
                            <span className="shrink-0 text-xs text-muted-foreground">{new Date(p.dataInicio).toLocaleDateString("pt-BR")} {" → "} {new Date(p.dataFim).toLocaleDateString("pt-BR")}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Section>
                </>
              )}
            </div>

            <div className="px-4 py-3 text-right sm:px-6" style={{ borderTop: "1px solid hsl(var(--border))" }}>
              <button onClick={() => setDetails(null)} className="rounded-md border border-border px-4 py-2 text-sm transition hover:bg-muted">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── sub-componentes ────────────────────────────────────────────────────────
function Section({ icon, title, count, children }: { icon: React.ReactNode; title: string; count: number; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className="text-primary">{icon}</span>
        <h3 className="font-display text-sm font-bold uppercase tracking-widest text-foreground">{title}</h3>
        <span className="ml-auto rounded-full px-2 py-0.5 text-xs text-muted-foreground" style={{ backgroundColor: "hsl(var(--muted))" }}>{count}</span>
      </div>
      {children}
    </div>
  );
}

function EstabelecimentoCard({ nome, sub, status, logo }: { nome: string; sub: string; status: string; logo?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg px-3 py-2" style={{ backgroundColor: "hsl(var(--muted))", border: "1px solid hsl(var(--border))" }}>
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt={nome} width={32} height={32} className="h-8 w-8 flex-shrink-0 rounded object-cover"
          onError={(e) => { const t = e.currentTarget; t.style.display = "none"; const f = t.nextElementSibling as HTMLElement | null; if (f) f.style.display = "flex"; }}
        />
      ) : null}
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-muted text-muted-foreground" style={logo ? { display: "none" } : {}}>
        <span className="text-xs font-bold">{nome.charAt(0).toUpperCase()}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{nome}</p>
        <p className="truncate text-xs text-muted-foreground">{sub}</p>
      </div>
      <StatusBadge status={status} />
    </div>
  );
}

function Empty() {
  return <p className="text-sm italic text-muted-foreground">Nenhum registro encontrado.</p>;
}
