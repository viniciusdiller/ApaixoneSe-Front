"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { casaDeCambioApi } from "@/lib/api";
import type { CasaDeCambio } from "@/lib/api";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminFormField } from "@/components/admin/AdminFormField";
import { LoadingGrid } from "@/components/ui/LoadingGrid";
import { Plus, Eye, Pencil } from "lucide-react";
import { maskPhone, numericInputProps } from "@/lib/masks";

const empty = {
  nome: "",
  telefone: "",
  endereco: "",
};

const statusClass = (s: string) =>
  s === "APROVADO"
    ? "bg-green-100 text-green-700"
    : s === "REJEITADO"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700";

export default function AdminCasaDeCambioPage() {
  const [items, setItems] = useState<CasaDeCambio[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: CasaDeCambio | null }>({
    open: false,
    editing: null,
  });
  const [viewing, setViewing] = useState<CasaDeCambio | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();

  if (!user) return null;

  const load = () => {
    setLoading(true);
    casaDeCambioApi
      .getAll()
      .then((c) => setItems(c))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => {
    setForm(empty);
    setError("");
    setModal({ open: true, editing: null });
  };

  const openEdit = (item: CasaDeCambio) => {
    setForm({
      nome: item.nome,
      telefone: item.telefone,
      endereco: item.endereco,
    });
    setError("");
    setModal({ open: true, editing: item });
  };

  const closeModal = () => setModal({ open: false, editing: null });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      // Envia JSON puro — o backend usa @Body() com class-validator, sem FileInterceptor
      const payload = {
        nome: form.nome,
        telefone: form.telefone,
        endereco: form.endereco,
        usuarioId: user.id,
      };

      modal.editing
        ? await casaDeCambioApi.update(modal.editing.id, payload)
        : await casaDeCambioApi.create(payload);

      closeModal();
      load();
    } catch (err: unknown) {
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

  const handleDelete = async (item: CasaDeCambio) => {
    if (!confirm(`Excluir "${item.nome}"?`)) return;
    await casaDeCambioApi.delete(item.id);
    load();
  };

  const set =
    (k: keyof typeof empty) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | string) => {
      const value = typeof e === "string" ? e : e.target.value;
      setForm((prev) => ({ ...prev, [k]: value }));
    };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-widest">
            Casas de C&#226;mbio
          </h1>
          <p className="text-sm text-muted-foreground">{items.length} registros</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Nova Casa de C&#226;mbio
        </button>
      </div>

      {loading ? (
        <LoadingGrid count={3} />
      ) : (
        <AdminTable
          data={items}
          columns={[
            { key: "nome", label: "Nome" },
            { key: "telefone", label: "Telefone" },
            { key: "endereco", label: "Endere&#231;o" },
            {
              key: "status",
              label: "Status",
              render: (_val, row) => (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClass(row.status)}`}
                >
                  {row.status}
                </span>
              ),
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

      {/* Modal Visualiza&#231;&#227;o */}
      <AdminModal
        title="Detalhes da Casa de C&#226;mbio"
        open={!!viewing}
        onClose={() => setViewing(null)}
      >
        {viewing && (
          <div className="space-y-3">
            <div>
              <p className="font-display font-bold text-lg uppercase tracking-wide">{viewing.nome}</p>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClass(viewing.status)}`}>
                {viewing.status}
              </span>
            </div>
            <ViewRow label="Telefone" value={viewing.telefone} />
            <ViewRow label="Endere&#231;o" value={viewing.endereco} />
          </div>
        )}
      </AdminModal>

      {/* Modal Criar/Editar */}
      <AdminModal
        title={modal.editing ? "Editar Casa de C&#226;mbio" : "Nova Casa de C&#226;mbio"}
        open={modal.open}
        onClose={closeModal}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <AdminFormField label="Nome" value={form.nome} onChange={set("nome")} required />
          <AdminFormField
            label="Telefone"
            value={form.telefone}
            onChange={set("telefone")}
            mask={maskPhone}
            maxLength={15}
            {...numericInputProps}
            required
          />
          <AdminFormField label="Endere&#231;o" value={form.endereco} onChange={set("endereco")} required />

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
      <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground whitespace-pre-wrap">{value}</dd>
    </div>
  );
}
