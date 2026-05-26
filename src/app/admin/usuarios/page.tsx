"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";

// ── tipos ──────────────────────────────────────────────────────────────────
interface EditForm {
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
  USUARIO: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  PARCEIRO:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  ADMIN: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
};

// ── helpers ────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    APROVADO:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    PENDENTE:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    REJEITADO:
      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        map[status] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}

// ── componente principal ───────────────────────────────────────────────────
export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // modal editar
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    nome: "",
    usuario: "",
    email: "",
    perfil: "USUARIO",
    senha: "",
  });
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");

  // modal detalhes
  const [details, setDetails] = useState<UserDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // ── load ──
  const load = () => {
    setLoading(true);
    usersApi
      .getAll()
      .then(setUsers)
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  // ── abrir edição ──
  const openEdit = (user: User) => {
    setEditUser(user);
    setEditForm({
      nome: user.nome,
      usuario: user.usuario,
      email: user.email,
      perfil: user.perfil,
      senha: "",
    });
    setEditError("");
  };

  // ── salvar edição ──
  const handleSave = async () => {
    if (!editUser) return;
    setSaving(true);
    setEditError("");
    try {
      const payload: Record<string, string> = {
        nome: editForm.nome,
        usuario: editForm.usuario,
        email: editForm.email,
        perfil: editForm.perfil,
      };
      if (editForm.senha.trim()) payload.senha = editForm.senha;
      await usersApi.update(editUser.id, payload);
      setEditUser(null);
      load();
    } catch (err: unknown) {
      setEditError(
        err instanceof Error ? err.message : "Erro ao salvar alterações"
      );
    } finally {
      setSaving(false);
    }
  };

  // ── excluir ──
  const handleDelete = async (user: User) => {
    if (!confirm(`Excluir usuário "${user.nome}"?`)) return;
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
      // mostra o que tiver
    } finally {
      setDetailsLoading(false);
    }
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* cabeçalho */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-widest text-foreground">
            Usuários
          </h1>
          <p className="text-sm text-muted-foreground">{users.length} registros</p>
        </div>
      </div>

      {/* tabela */}
      {loading ? (
        <LoadingGrid count={3} />
      ) : (
        <AdminTable<User>
          data={users}
          columns={[
            { key: "usuario", label: "Login" },
            { key: "nome", label: "Nome" },
            { key: "email", label: "E-mail" },
            {
              key: "perfil",
              label: "Perfil",
              render: (_, row) => (
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    PERFIL_BADGE[row.perfil] ?? ""
                  }`}
                >
                  {row.perfil}
                </span>
              ),
            },
            {
              key: "createdAt",
              label: "Criado em",
              render: (_, row) =>
                row.createdAt
                  ? new Date(row.createdAt).toLocaleDateString("pt-BR")
                  : "—",
            },
          ]}
          extraActions={(row) => (
            <>
              <button
                onClick={() => openDetails(row)}
                title="Ver detalhes"
                className="rounded p-1 text-muted-foreground transition hover:bg-surface-offset hover:text-primary"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={() => openEdit(row)}
                title="Editar"
                className="rounded p-1 text-muted-foreground transition hover:bg-surface-offset hover:text-primary"
              >
                <Pencil size={16} />
              </button>
            </>
          )}
          onDelete={handleDelete}
        />
      )}

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
            <p className="rounded bg-error/10 px-3 py-2 text-sm text-error">
              {editError}
            </p>
          )}
          <AdminFormField
            label="Nome completo"
            value={editForm.nome}
            onChange={(v) => setEditForm((f) => ({ ...f, nome: v }))}
            required
          />
          <AdminFormField
            label="Nome de usuário (login)"
            value={editForm.usuario}
            onChange={(v) => setEditForm((f) => ({ ...f, usuario: v }))}
            required
          />
          <AdminFormField
            label="E-mail"
            type="email"
            value={editForm.email}
            onChange={(v) => setEditForm((f) => ({ ...f, email: v }))}
            required
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-foreground">
              Perfil
            </label>
            <select
              value={editForm.perfil}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, perfil: e.target.value as Perfil }))
              }
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {PERFIS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <AdminFormField
            label="Nova senha (deixe vazio para não alterar)"
            type="password"
            value={editForm.senha}
            onChange={(v) => setEditForm((f) => ({ ...f, senha: v }))}
          />
        </div>
      </AdminModal>

      {/* ── Modal Detalhes ────────────────────────────────────────────── */}
      {details && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-surface shadow-lg">
            {/* header */}
            <div className="flex items-center gap-3 border-b border-border px-6 py-4">
              <UserCircle size={24} className="text-primary" />
              <div className="flex-1">
                <h2 className="font-display text-xl font-bold uppercase tracking-widest">
                  {details.user.nome}
                </h2>
                <p className="text-xs text-muted-foreground">
                  @{details.user.usuario} · {details.user.email}
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  PERFIL_BADGE[details.user.perfil]
                }`}
              >
                {details.user.perfil}
              </span>
              <button
                onClick={() => setDetails(null)}
                className="ml-2 rounded p-1 text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            {/* body scrollável */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {detailsLoading ? (
                <p className="text-sm text-muted-foreground">Carregando…</p>
              ) : (
                <>
                  <Section
                    icon={<UtensilsCrossed size={16} />}
                    title="Gastronomia"
                    count={details.gastronomias.length}
                  >
                    {details.gastronomias.length === 0 ? (
                      <Empty />
                    ) : (
                      details.gastronomias.map((g) => (
                        <EstabelecimentoCard
                          key={g.id}
                          nome={g.nome}
                          sub={g.endereco}
                          status={g.status}
                          logo={g.logoUrl}
                        />
                      ))
                    )}
                  </Section>

                  <Section
                    icon={<BedDouble size={16} />}
                    title="Hospedagem"
                    count={details.hospedagens.length}
                  >
                    {details.hospedagens.length === 0 ? (
                      <Empty />
                    ) : (
                      details.hospedagens.map((h) => (
                        <EstabelecimentoCard
                          key={h.id}
                          nome={h.nome}
                          sub={h.endereco}
                          status={h.status}
                          logo={h.logoUrl}
                        />
                      ))
                    )}
                  </Section>

                  <Section
                    icon={<Briefcase size={16} />}
                    title="Serviços Turísticos"
                    count={details.servicos.length}
                  >
                    {details.servicos.length === 0 ? (
                      <Empty />
                    ) : (
                      details.servicos.map((s) => (
                        <EstabelecimentoCard
                          key={s.id}
                          nome={s.nome}
                          sub={s.tipo}
                          status={s.status}
                          logo={s.logoUrl ?? undefined}
                        />
                      ))
                    )}
                  </Section>

                  <Section
                    icon={<Map size={16} />}
                    title="Planos de Viagem"
                    count={details.planos.length}
                  >
                    {details.planos.length === 0 ? (
                      <Empty />
                    ) : (
                      <div className="space-y-2">
                        {details.planos.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
                          >
                            <span className="font-medium">{p.titulo}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(p.dataInicio).toLocaleDateString("pt-BR")}
                              {" → "}
                              {new Date(p.dataFim).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Section>
                </>
              )}
            </div>

            {/* footer */}
            <div className="border-t border-border px-6 py-3 text-right">
              <button
                onClick={() => setDetails(null)}
                className="rounded-md border border-border px-4 py-2 text-sm transition hover:bg-surface-offset"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── sub-componentes ────────────────────────────────────────────────────────
function Section({
  icon,
  title,
  count,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className="text-primary">{icon}</span>
        <h3 className="font-display text-sm font-bold uppercase tracking-widest">
          {title}
        </h3>
        <span className="ml-auto rounded-full bg-surface-offset px-2 py-0.5 text-xs text-muted-foreground">
          {count}
        </span>
      </div>
      {children}
    </div>
  );
}

function EstabelecimentoCard({
  nome,
  sub,
  status,
  logo,
}: {
  nome: string;
  sub: string;
  status: string;
  logo?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 px-3 py-2">
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo}
          alt={nome}
          width={32}
          height={32}
          className="h-8 w-8 rounded object-cover"
        />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded bg-surface-offset text-muted-foreground">
          <span className="text-xs font-bold">{nome.charAt(0)}</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium">{nome}</p>
        <p className="truncate text-xs text-muted-foreground">{sub}</p>
      </div>
      <StatusBadge status={status} />
    </div>
  );
}

function Empty() {
  return (
    <p className="text-sm italic text-muted-foreground">Nenhum registro encontrado.</p>
  );
}
