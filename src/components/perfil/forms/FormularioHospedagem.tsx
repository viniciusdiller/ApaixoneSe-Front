"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { hospedagemApi } from "@/lib/api";
import { HOSPEDAGEM_TAGS } from "@/lib/api/hospedagem"; // Puxando as tags do seu arquivo
import { PerfilFormField } from "@/components/perfil/forms/PerfilFormField";
import { FileUploadField } from "@/components/admin/FileUploadField";
import { safeMediaUrl } from "@/lib/safeMediaUrl";
import {
  maskCnpj,
  maskCpf,
  maskPersonName,
  maskPhone,
  numericInputProps,
} from "@/lib/masks";
import { FileText, ExternalLink, AlertTriangle, Tag } from "lucide-react";

interface FormularioHospedagemProps {
  modo: "criar" | "editar";
  estabelecimentoId?: string;
  dadosIniciais?: any;
}

const emptyForm = {
  nome: "",
  telefone: "",
  endereco: "",
  textoDiferencial: "",
  cnpj: "",
  responsavelNome: "",
  responsavelCpf: "",
  instagram: "",
  site: "",
  logoUrl: "",
  tags: [] as string[],
};

export function FormularioHospedagem({
  modo,
  estabelecimentoId,
  dadosIniciais,
}: FormularioHospedagemProps) {
  const router = useRouter();

  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState<{ logo?: File; comprovante?: File }>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const comprovanteRef = useRef<HTMLInputElement>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (modo === "editar" && dadosIniciais) {
      // Garantir que as tags vêm como array
      const existingTags: string[] = (() => {
        const raw = dadosIniciais.tags;
        if (!raw) return [];
        if (Array.isArray(raw)) return raw as string[];
        try {
          return JSON.parse(raw as unknown as string) as string[];
        } catch {
          return [];
        }
      })();

      setForm({
        nome: dadosIniciais.nome,
        telefone: dadosIniciais.telefone,
        endereco: dadosIniciais.endereco,
        textoDiferencial: dadosIniciais.textoDiferencial ?? "",
        cnpj: dadosIniciais.cnpj,
        responsavelNome: dadosIniciais.responsavelNome,
        responsavelCpf: dadosIniciais.responsavelCpf,
        instagram: dadosIniciais.instagram ?? "",
        site: dadosIniciais.site ?? "",
        logoUrl: dadosIniciais.logoUrl ?? "",
        tags: existingTags,
      });
    } else {
      setForm(emptyForm);
      setFiles({});
    }
  }, [modo, dadosIniciais]);

  const set =
    (k: string) =>
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
  const setField = (k: string, value: string) =>
    setForm((prev) => ({ ...prev, [k]: value }));

  const toggleTag = (tag: string) => {
    setForm((prev) => {
      const current = prev.tags ?? [];
      return {
        ...prev,
        tags: current.includes(tag)
          ? current.filter((t) => t !== tag)
          : [...current, tag],
      };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const fd = new FormData();
      fd.append("nome", form.nome);
      fd.append("telefone", form.telefone);
      fd.append("endereco", form.endereco);
      fd.append("textoDiferencial", form.textoDiferencial);
      fd.append("cnpj", form.cnpj);
      fd.append("responsavelNome", form.responsavelNome);
      fd.append("responsavelCpf", form.responsavelCpf);

      if (form.instagram) fd.append("instagram", form.instagram);
      if (form.site) fd.append("site", form.site);
      if (form.tags && form.tags.length > 0)
        fd.append("tags", JSON.stringify(form.tags));

      if (files.logo) fd.append("logo", files.logo);
      if (files.comprovante) fd.append("documentoPdf", files.comprovante);

      if (modo === "editar" && estabelecimentoId) {
        await hospedagemApi.update(estabelecimentoId, fd);
        alert("Atualizado com sucesso!");
      } else {
        await hospedagemApi.create(fd);
        alert("Enviado para análise com sucesso!");
      }

      router.push("/perfil");
    } catch (err: unknown) {
      try {
        const p = JSON.parse((err as Error).message);
        setError(Array.isArray(p.message) ? p.message.join(" ") : p.message);
      } catch {
        setError("Erro ao salvar.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!estabelecimentoId) return;
    setIsDeleting(true);
    try {
      await hospedagemApi.delete(estabelecimentoId);
      setShowDeleteModal(false);
      router.push("/perfil");
    } catch (err) {
      alert("Erro ao excluir o estabelecimento.");
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const comprovanteExistente = dadosIniciais?.documentoPdfUrl ?? null;
  const comprovantePreviewUrl = files.comprovante
    ? URL.createObjectURL(files.comprovante)
    : safeMediaUrl(comprovanteExistente);

  return (
    <>
      <div className="max-w-2xl mx-auto p-6 bg-card rounded-xl border border-border shadow-sm">
        <h2 className="text-2xl font-bold mb-6">
          {modo === "criar"
            ? "Cadastrar Nova Hospedagem"
            : "Gerenciar Hospedagem"}
        </h2>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Linha 1: Nome e Telefone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PerfilFormField
              label="Nome"
              value={form.nome}
              onChange={set("nome")}
              required
            />
            <PerfilFormField
              label="Telefone"
              value={form.telefone}
              onChange={set("telefone")}
              mask={maskPhone}
              maxLength={15}
              {...numericInputProps}
              required
            />
          </div>

          {/* Linha 2: Endereço */}
          <PerfilFormField
            label="Endereço"
            value={form.endereco}
            onChange={set("endereco")}
            required
          />

          {/* Linha 3: Texto Diferencial */}
          <PerfilFormField
            label="Texto Diferencial"
            value={form.textoDiferencial}
            onChange={set("textoDiferencial")}
            multiline
            rows={4}
            required
          />

          {/* Linha 4: CNPJ e Instagram */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PerfilFormField
              label="CNPJ"
              value={form.cnpj}
              onChange={set("cnpj")}
              mask={maskCnpj}
              maxLength={18}
              {...numericInputProps}
              required
            />
            <PerfilFormField
              label="Instagram"
              value={form.instagram}
              onChange={set("instagram")}
            />
          </div>

          {/* Linha 5: Site */}
          <PerfilFormField
            label="Site"
            value={form.site}
            onChange={set("site")}
          />

          {/* Linha 6: Responsáveis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PerfilFormField
              label="Responsável (Nome)"
              value={form.responsavelNome}
              onChange={set("responsavelNome")}
              mask={maskPersonName}
              required
            />
            <PerfilFormField
              label="Responsável (CPF)"
              value={form.responsavelCpf}
              onChange={set("responsavelCpf")}
              mask={maskCpf}
              maxLength={14}
              {...numericInputProps}
              required
            />
          </div>

          {/* Comodidades (Tags) */}
          <div className="space-y-3 pt-4">
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Tag className="h-4 w-4" /> Comodidades (opcional)
            </label>
            <div className="flex flex-wrap gap-2">
              {HOSPEDAGEM_TAGS.map((tag) => {
                const active = (form.tags ?? []).includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-all ${
                      active
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-primary"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Arquivos (Logo e Comprovante) */}
          <div className="pt-4 border-t border-border mt-6">
            <FileUploadField
              label="Logo da Hospedagem"
              accept="image"
              currentUrl={form.logoUrl}
              required={modo === "criar"}
              hint="PNG, JPG ou WEBP"
              onFileChange={(url, file) => {
                setField("logoUrl", url);
                setFiles((p) => ({ ...p, logo: file }));
              }}
              onClear={() => {
                setField("logoUrl", "");
                setFiles((p) => ({ ...p, logo: undefined }));
              }}
            />
          </div>

          <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FileText size={13} /> Comprovante (PDF ou Imagem)
            </p>
            <div className="space-y-2">
              {comprovantePreviewUrl && (
                <a
                  href={comprovantePreviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-primary font-medium"
                >
                  <FileText size={14} />{" "}
                  {files.comprovante
                    ? files.comprovante.name
                    : "Ver comprovante atual"}{" "}
                  <ExternalLink size={12} />
                </a>
              )}
              <button
                type="button"
                onClick={() => comprovanteRef.current?.click()}
                className="flex items-center gap-2 rounded-md border border-dashed border-border bg-muted/20 px-3 py-2 text-xs font-medium text-muted-foreground transition hover:border-primary hover:text-primary mt-2"
              >
                <FileText size={14} /> Selecionar arquivo
              </button>
              <input
                ref={comprovanteRef}
                type="file"
                accept="application/pdf,image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setFiles((p) => ({ ...p, comprovante: f }));
                }}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm font-medium text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">
              {error}
            </p>
          )}

          {/* Botões de Ação */}
          <div className="flex justify-end gap-3 pt-6 border-t border-border">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 text-sm font-semibold border rounded-lg transition hover:bg-muted text-foreground"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 text-sm font-bold text-white bg-primary rounded-lg transition hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>

        {/* ZONA DE PERIGO */}
        {modo === "editar" && (
          <div className="mt-12 rounded-xl border border-red-500 p-6">
            <h3 className="text-xl font-bold text-red-600 mb-2">
              Zona de Perigo
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Ao excluir esta hospedagem, todos os dados, imagens e informações
              serão permanentemente removidos. Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="px-6 py-2.5 text-sm font-semibold text-red-600 bg-background border border-red-500 rounded-md transition hover:bg-red-600 hover:text-white"
              >
                Excluir Hospedagem
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL DE CONFIRMAÇÃO */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-background rounded-2xl shadow-xl max-w-sm w-full p-6 border border-border animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">
                Você tem certeza?
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Esta ação é irreversível. A hospedagem{" "}
                <strong>{form.nome || "selecionada"}</strong> será excluída
                permanentemente.
              </p>

              <div className="flex gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold border border-border rounded-xl transition hover:bg-muted disabled:opacity-50 text-foreground"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl transition hover:bg-red-700 disabled:opacity-50"
                >
                  {isDeleting ? "Excluindo..." : "Sim, Excluir"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
