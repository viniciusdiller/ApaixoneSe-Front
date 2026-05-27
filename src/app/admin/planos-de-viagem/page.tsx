"use client";

import { useEffect, useState } from "react";
import { planoViagemApi } from "@/lib/api";
import type { PlanoViagem, CreatePlanoViagemDto } from "@/lib/api";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminFormField } from "@/components/admin/AdminFormField";
import { LoadingGrid } from "@/components/ui/LoadingGrid";
import { Plus, Eye, Pencil } from "lucide-react";

const empty: CreatePlanoViagemDto = { titulo: "", descricao: "" };

export default function AdminPlanosPage() {
  const [items, setItems] = useState<PlanoViagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{
    open: boolean;
    editing: PlanoViagem | null;
  }>({ open: false, editing: null });
  const [viewing, setViewing] = useState<PlanoViagem | null>(null);
  const [form, setForm] = useState<CreatePlanoViagemDto>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    planoViagemApi
      .getAll()
      .then(setItems)
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => {
    setForm(empty);
    setError("");
    setModal({ open: true, editing: null });
  };
  const openEdit = (item: PlanoViagem) => {
    setForm({ titulo: item.titulo, descricao: item.descricao });
    setError("");
    setModal({ open: true, editing: item });
  };
  const closeModal = () => setModal({ open: false, editing: null });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        titulo: form.titulo,
        dataInicio: form.dataInicio.includes("T")
          ? form.dataInicio
          : `${form.dataInicio}T00:00:00Z`,
        dataFim: form.dataFim,
        usuarioId: form.usuarioId, // Se o seu backend exige o ID, mantenha. Se ele captura do token, REMOVA esta linha.
      };

      modal.editing
        ? await planoViagemApi.update(modal.editing.id, payload)
        : await planoViagemApi.create(payload);

      closeModal();
      load();
    } catch (err: unknown) {
      // (O mesmo bloco de tratamento de erro robusto que fizemos antes)
      console.error("Erro detalhado:", err);
      let msg = "Erro ao salvar.";
      if (err instanceof Error) {
        try {
          const p = JSON.parse(err.message);
          msg = Array.isArray(p.message) ? p.message.join(", ") : p.message;
        } catch {
          msg = err.message;
        }
      }
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: PlanoViagem) => {
    if (!confirm(`Excluir plano "${item.titulo}"?`)) return;
    await planoViagemApi.remove(item.id);
    load();
  };

  const set =
    (k: keyof CreatePlanoViagemDto) =>
    (
      e:
        | React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
          >
        | string,
    ) => {
      const value = typeof e === "string" ? e : e.target.value;
      setForm((prev) => ({ ...prev, [k]: value }));
    };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-widest text-foreground">
            Planos de Viagem
          </h1>
          <p className="text-sm text-muted-foreground">
            {items.length} registros
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Novo Plano
        </button>
      </div>

      {loading ? (
        <LoadingGrid count={3} />
      ) : (
        <AdminTable
          data={items}
          columns={[
            { key: "titulo", label: "Título" },
            {
              key: "descricao",
              label: "Descrição",
              render: (_val, row) => (
                <span className="line-clamp-1 max-w-xs">
                  {row.descricao ?? "—"}
                </span>
              ),
            },
            {
              key: "createdAt",
              label: "Criado em",
              render: (_val, row) =>
                row.createdAt
                  ? new Date(row.createdAt).toLocaleDateString("pt-BR")
                  : "—",
            },
          ]}
          extraActions={(row) => (
            <>
              <button
                onClick={() => setViewing(row)}
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

      {/* Modal Visualização */}
      <AdminModal
        title="Detalhes do Plano"
        open={!!viewing}
        onClose={() => setViewing(null)}
      >
        {viewing && (
          <dl className="space-y-3 text-sm">
            <ViewRow label="Título" value={viewing.titulo} />
            <ViewRow label="Descrição" value={viewing.descricao} />
            {viewing.createdAt && (
              <ViewRow
                label="Criado em"
                value={new Date(viewing.createdAt).toLocaleString("pt-BR")}
              />
            )}
          </dl>
        )}
      </AdminModal>

      {/* Modal Criar/Editar */}
      <AdminModal
        title={modal.editing ? "Editar Plano" : "Novo Plano"}
        open={modal.open}
        onClose={closeModal}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <AdminFormField
            label="Título"
            value={form.titulo}
            onChange={set("titulo")}
            required
          />
          <AdminFormField
            label="Descrição"
            value={form.descricao ?? ""}
            onChange={set("descricao")}
            multiline
          />
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500 dark:bg-red-950/30">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}

function ViewRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm text-foreground whitespace-pre-wrap">{value}</dd>
    </div>
  );
}
