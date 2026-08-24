"use client";

import { confirmAction, notify } from "@/lib/feedback";

import { useEffect, useState } from "react";
import { pontosAguaApi } from "@/lib/api";
import type { PontoAgua, TipoPontoAgua } from "@/lib/api";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminFormField } from "@/components/admin/AdminFormField";
import { FileUploadField } from "@/components/admin/FileUploadField";
import { MediaPreview } from "@/components/admin/MediaPreview";
import { LoadingGrid } from "@/components/ui/LoadingGrid";
import { Plus, Eye, Pencil } from "lucide-react";

type Tab = Extract<TipoPontoAgua, "PRAIA" | "LAGOA">;

const TABS: { key: Tab; label: string; emoji: string }[] = [
  { key: "PRAIA", label: "Praias", emoji: "🏖️" },
  { key: "LAGOA", label: "Lagoas", emoji: "🌊" },
];

const DIFICULDADES_SURF = [
  { value: "iniciante", label: "Iniciante" },
  { value: "intermediário", label: "Intermediário" },
  { value: "avançado", label: "Avançado" },
];

const FILTROS_PRAIA = ["Surf", "Família", "Bandeira Azul"];

interface FormState {
  tipo: TipoPontoAgua;
  nome: string;
  descricaoCurta: string;
  descricao: string;
  filtros: string[];
  dificuldade: string;
  acessivel: boolean;
  estacionamento: boolean;
  quiosques: boolean;
  endereco: string;
  latitude: string;
  longitude: string;
  imagemUrl: string;
}

const emptyForm = (tipo: TipoPontoAgua): FormState => ({
  tipo,
  nome: "",
  descricaoCurta: "",
  descricao: "",
  filtros: [],
  dificuldade: "",
  acessivel: false,
  estacionamento: false,
  quiosques: false,
  endereco: "",
  latitude: "",
  longitude: "",
  imagemUrl: "",
});

export default function AdminPraiasLagoasPage() {
  const [activeTab, setActiveTab] = useState<Tab>("PRAIA");
  const [items, setItems] = useState<PontoAgua[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{
    open: boolean;
    editing: PontoAgua | null;
  }>({
    open: false,
    editing: null,
  });
  const [viewing, setViewing] = useState<PontoAgua | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm("PRAIA"));
  const [files, setFiles] = useState<{ imagem?: File }>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    pontosAguaApi
      .getAll()
      .then(setItems)
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = items.filter((i) => i.tipo === activeTab);

  const openCreate = () => {
    setForm(emptyForm(activeTab));
    setFiles({});
    setError("");
    setModal({ open: true, editing: null });
  };

  const openEdit = (item: PontoAgua) => {
    setForm({
      tipo: item.tipo,
      nome: item.nome,
      descricaoCurta: item.descricaoCurta,
      descricao: item.descricao,
      filtros: item.filtros ?? [],
      dificuldade: item.dificuldade ?? "",
      acessivel: item.acessivel,
      estacionamento: item.estacionamento,
      quiosques: item.quiosques,
      endereco: item.endereco ?? "",
      latitude: item.latitude != null ? String(item.latitude) : "",
      longitude: item.longitude != null ? String(item.longitude) : "",
      imagemUrl: item.imagemUrl ?? "",
    });
    setFiles({});
    setError("");
    setModal({ open: true, editing: item });
  };

  const closeModal = () => setModal({ open: false, editing: null });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("tipo", form.tipo);
      formData.append("nome", form.nome);
      formData.append("descricaoCurta", form.descricaoCurta);
      formData.append("descricao", form.descricao);

      // Os filtros agora são um array garantido, basta stringificar
      formData.append("filtros", JSON.stringify(form.filtros));

      formData.append("acessivel", String(form.acessivel));
      formData.append("estacionamento", String(form.estacionamento));
      formData.append("quiosques", String(form.quiosques));

      if (form.dificuldade) formData.append("dificuldade", form.dificuldade);
      if (form.endereco) formData.append("endereco", form.endereco);
      if (form.latitude)
        formData.append("latitude", form.latitude.replace(",", "."));
      if (form.longitude)
        formData.append("longitude", form.longitude.replace(",", "."));
      if (files.imagem) formData.append("imagem", files.imagem);

      modal.editing
        ? await pontosAguaApi.update(modal.editing.id, formData)
        : await pontosAguaApi.create(formData);

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

  const handleDelete = async (item: PontoAgua) => {
    if (!(await confirmAction(`Excluir "${item.nome}"?`))) return;
    await pontosAguaApi.remove(item.id);
    load();
  };

  const set =
    (k: keyof FormState) =>
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

  const setField = (k: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [k]: value }));

  const toggle = (k: "acessivel" | "estacionamento" | "quiosques") =>
    setForm((prev) => ({ ...prev, [k]: !prev[k] }));

  // Função para controlar os checkboxes de filtro
  const toggleFiltro = (filtro: string) => {
    setForm((prev) => {
      const isSelected = prev.filtros.includes(filtro);
      return {
        ...prev,
        filtros: isSelected
          ? prev.filtros.filter((f) => f !== filtro)
          : [...prev.filtros, filtro],
      };
    });
  };

  const handlePasteLatLng = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedData = e.clipboardData.getData("text");
    if (pastedData.includes(",")) {
      e.preventDefault();
      const [lat, lng] = pastedData.split(",").map((c) => c.trim());
      setForm((prev) => ({
        ...prev,
        latitude: lat ?? prev.latitude,
        longitude: lng ?? prev.longitude,
      }));
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-widest sm:text-3xl">
            Praias e Lagoas
          </h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} registros
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />{" "}
          {activeTab === "PRAIA" ? "Nova Praia" : "Nova Lagoa"}
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl bg-muted p-1 w-fit">
        {TABS.map(({ key, label, emoji }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === key
                ? "bg-white shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>{emoji}</span>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingGrid count={3} />
      ) : (
        <AdminTable
          data={filtered}
          columns={[
            {
              key: "imagemUrl",
              label: "Imagem",
              render: (_val, row) => (
                <MediaPreview url={row.imagemUrl ?? ""} label={row.nome} />
              ),
            },
            { key: "nome", label: "Nome" },
            {
              key: "descricaoCurta",
              label: "Descrição curta",
              render: (_val, row) => (
                <span className="line-clamp-2 max-w-[160px] text-sm sm:max-w-sm">
                  {row.descricaoCurta}
                </span>
              ),
            },
          ]}
          extraActions={(row) => (
            <>
              <button
                onClick={() => setViewing(row)}
                title="Ver detalhes"
                aria-label="Ver detalhes"
                className="flex h-9 w-9 items-center justify-center rounded text-muted-foreground transition hover:bg-surface-offset hover:text-primary"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={() => openEdit(row)}
                title="Editar"
                aria-label="Editar"
                className="flex h-9 w-9 items-center justify-center rounded text-muted-foreground transition hover:bg-surface-offset hover:text-primary"
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
        title={
          viewing?.tipo === "LAGOA" ? "Detalhes da Lagoa" : "Detalhes da Praia"
        }
        open={!!viewing}
        onClose={() => setViewing(null)}
      >
        {viewing && (
          <div className="space-y-3">
            <MediaPreview url={viewing.imagemUrl ?? ""} label={viewing.nome} />
            <div>
              <p className="font-display font-bold text-lg uppercase tracking-wide">
                {viewing.nome}
              </p>
              <p className="text-xs text-muted-foreground">/{viewing.slug}</p>
            </div>
            <ViewRow label="Descrição curta" value={viewing.descricaoCurta} />
            <ViewRow label="Descrição" value={viewing.descricao} />
            {viewing.tipo === "PRAIA" &&
              viewing.filtros &&
              viewing.filtros.length > 0 && (
                <ViewRow label="Filtros" value={viewing.filtros.join(", ")} />
              )}
            <ViewRow label="Dificuldade de Surf" value={viewing.dificuldade} />
            <ViewRow label="Endereço" value={viewing.endereco} />
            {viewing.latitude != null && (
              <ViewRow label="Latitude" value={String(viewing.latitude)} />
            )}
            {viewing.longitude != null && (
              <ViewRow label="Longitude" value={String(viewing.longitude)} />
            )}
            <div className="flex flex-wrap gap-2 pt-1">
              <Badge active={viewing.acessivel} label="Acessível" />
              <Badge active={viewing.estacionamento} label="Estacionamento" />
              <Badge active={viewing.quiosques} label="Quiosques" />
            </div>
          </div>
        )}
      </AdminModal>

      {/* Modal Criar/Editar */}
      <AdminModal
        title={
          modal.editing
            ? form.tipo === "LAGOA"
              ? "Editar Lagoa"
              : "Editar Praia"
            : form.tipo === "LAGOA"
              ? "Nova Lagoa"
              : "Nova Praia"
        }
        open={modal.open}
        onClose={closeModal}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {/* O campo "Tipo" agora é apenas leitura para evitar falha na UI */}
          <div className="space-y-1 mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tipo
            </label>
            <div className="w-full rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-foreground cursor-not-allowed font-medium">
              {form.tipo === "PRAIA" ? "Praia" : "Lagoa"}
            </div>
          </div>

          <AdminFormField
            label="Nome"
            value={form.nome}
            onChange={set("nome")}
            maxLength={100}
            required
          />
          <AdminFormField
            label="Descrição curta (exibida no card)"
            value={form.descricaoCurta}
            onChange={set("descricaoCurta")}
            maxLength={191}
            required
          />
          <AdminFormField
            label="Descrição completa"
            value={form.descricao}
            onChange={set("descricao")}
            maxLength={3000}
            multiline
            required
          />

          {/* Filtros em formato de Checkbox (Aparece apenas para PRAIAS) */}
          {form.tipo === "PRAIA" && (
            <div className="space-y-2 py-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Filtros da Praia
              </label>
              <div className="flex flex-wrap gap-4 rounded-md border border-border p-4 bg-muted/20">
                {FILTROS_PRAIA.map((filtro) => (
                  <Checkbox
                    key={filtro}
                    label={filtro}
                    checked={form.filtros.includes(filtro)}
                    onChange={() => toggleFiltro(filtro)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Dificuldade de Surf (opcional)
            </label>
            <select
              value={form.dificuldade}
              onChange={set("dificuldade")}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Selecione...</option>
              {DIFICULDADES_SURF.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <AdminFormField
            label="Endereço"
            value={form.endereco}
            onChange={set("endereco")}
            maxLength={191}
            placeholder="Rua Principal, 123 - Centro, Saquarema - RJ"
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <AdminFormField
              label="Latitude"
              value={form.latitude}
              onChange={set("latitude")}
              onPaste={handlePasteLatLng}
              type="text"
            />
            <AdminFormField
              label="Longitude"
              value={form.longitude}
              onChange={set("longitude")}
              type="text"
            />
          </div>
          <div className="flex flex-wrap gap-4 pt-1">
            <Checkbox
              label="Acessível"
              checked={form.acessivel}
              onChange={() => toggle("acessivel")}
            />
            <Checkbox
              label="Estacionamento"
              checked={form.estacionamento}
              onChange={() => toggle("estacionamento")}
            />
            <Checkbox
              label="Quiosques"
              checked={form.quiosques}
              onChange={() => toggle("quiosques")}
            />
          </div>
          <FileUploadField
            label="Imagem"
            accept="image"
            currentUrl={form.imagemUrl ?? ""}
            hint="PNG, JPG ou WEBP"
            onFileChange={(url, file) => {
              setField("imagemUrl", url);
              setFiles((prev) => ({ ...prev, imagem: file }));
            }}
            onClear={() => {
              setField("imagemUrl", "");
              setFiles((prev) => ({ ...prev, imagem: undefined }));
            }}
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

function Badge({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
        active
          ? "bg-green-100 text-green-700"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {label}
    </span>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
      />
      {label}
    </label>
  );
}
