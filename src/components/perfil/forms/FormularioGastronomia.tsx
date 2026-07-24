"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { gastronomiaApi } from "@/lib/api";
import { PerfilFormField } from "@/components/perfil/forms/PerfilFormField";
import { FileUploadField } from "@/components/admin/FileUploadField";
import { safeMediaUrl } from "@/lib/safeMediaUrl";
import {
  FileText,
  ExternalLink,
  AlertTriangle,
  Sparkles,
  Building2,
} from "lucide-react";
import {
  maskCnpj,
  maskCpf,
  maskPersonName,
  maskPhone,
  numericInputProps,
} from "@/lib/masks";

interface FormularioGastronomiaProps {
  modo: "criar" | "editar";
  estabelecimentoId?: string;
  dadosIniciais?: any;
}

const emptyForm = {
  nome: "",
  telefone: "",
  endereco: "",
  especialidade: "",
  cnpj: "",
  responsavelNome: "",
  responsavelCpf: "",
  instagram: "",
  logoUrl: "",
};

export function FormularioGastronomia({
  modo,
  estabelecimentoId,
  dadosIniciais,
}: FormularioGastronomiaProps) {
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
      setForm({
        nome: dadosIniciais.nome,
        telefone: dadosIniciais.telefone,
        endereco: dadosIniciais.endereco,
        especialidade: dadosIniciais.especialidade ?? "",
        cnpj: dadosIniciais.cnpj,
        responsavelNome: dadosIniciais.responsavelNome,
        responsavelCpf: dadosIniciais.responsavelCpf,
        instagram: dadosIniciais.instagram ?? "",
        logoUrl: dadosIniciais.logoUrl ?? "",
      });
    } else {
      setForm(emptyForm);
      setFiles({});
    }
  }, [modo, dadosIniciais]);

  const set =
    (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | string) => {
      const value = typeof e === "string" ? e : e.target.value;
      setForm((prev) => ({ ...prev, [k]: value }));
    };

  const setField = (k: string, value: string) =>
    setForm((prev) => ({ ...prev, [k]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const fd = new FormData();
      fd.append("nome", form.nome);
      fd.append("telefone", form.telefone);
      fd.append("endereco", form.endereco);
      if (form.especialidade) fd.append("especialidade", form.especialidade);
      fd.append("cnpj", form.cnpj);
      fd.append("responsavelNome", form.responsavelNome);
      fd.append("responsavelCpf", form.responsavelCpf);
      if (form.instagram) fd.append("instagram", form.instagram);
      if (files.logo) fd.append("logo", files.logo);
      if (files.comprovante) fd.append("documentoPdf", files.comprovante);

      if (modo === "editar" && estabelecimentoId) {
        await gastronomiaApi.update(estabelecimentoId, fd);
        alert("Atualizado com sucesso!");
      } else {
        await gastronomiaApi.create(fd);
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
      await gastronomiaApi.delete(estabelecimentoId);
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
      <div className="mx-auto max-w-3xl overflow-hidden rounded-[28px] border border-border/70 bg-card shadow-xl shadow-black/5">
        <div className="relative border-b border-border/70 px-6 py-8 md:px-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(1,105,111,0.14),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(218,113,1,0.08),transparent_28%)]" />

          <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Solicitação de
                estabelecimento
              </div>

              <h2 className="font-display text-3xl font-bold uppercase leading-none text-foreground md:text-4xl">
                {modo === "criar"
                  ? "Cadastrar Novo Estabelecimento"
                  : "Gerenciar Estabelecimento"}
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
                Preencha os dados do seu negócio com a mesma experiência visual
                do restante do portal.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm text-muted-foreground shadow-sm">
              <div className="rounded-2xl bg-primary/10 p-2.5 text-primary">
                <Building2 className="h-5 w-5" />
              </div>
              <span>Dados comerciais e do responsável em um único fluxo.</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-8 px-6 py-8 md:px-8">
          <section className="space-y-5">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                Informações principais
              </p>
              <h3 className="font-display text-2xl font-bold uppercase text-foreground">
                Dados do negócio
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

            <PerfilFormField
              label="Endereço"
              value={form.endereco}
              onChange={set("endereco")}
              required
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <PerfilFormField
                label="Especialidade"
                value={form.especialidade}
                onChange={set("especialidade")}
              />
              <PerfilFormField
                label="CNPJ"
                value={form.cnpj}
                onChange={set("cnpj")}
                mask={maskCnpj}
                maxLength={18}
                {...numericInputProps}
                required
              />
            </div>
          </section>

          <section className="space-y-5 rounded-[24px] border border-border/70 bg-background/60 p-5 md:p-6">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                Responsável legal
              </p>
              <h3 className="font-display text-2xl font-bold uppercase text-foreground">
                Dados de validação
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

            <PerfilFormField
              label="Instagram"
              value={form.instagram}
              onChange={set("instagram")}
            />
          </section>

          <section className="space-y-5 rounded-[24px] border border-border/70 bg-background/60 p-5 md:p-6">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                Arquivos
              </p>
              <h3 className="font-display text-2xl font-bold uppercase text-foreground">
                Identidade visual e comprovação
              </h3>
            </div>

            <FileUploadField
              label="Logo do Estabelecimento"
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

            <div className="rounded-[22px] border border-dashed border-primary/20 bg-[linear-gradient(135deg,rgba(1,105,111,0.05),rgba(218,113,1,0.04))] p-5 space-y-4">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <FileText size={13} /> Comprovante (PDF ou Imagem)
              </p>

              <div className="space-y-2">
                {comprovantePreviewUrl && (
                  <a
                    href={comprovantePreviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
                  >
                    <FileText size={12} />{" "}
                    {files.comprovante
                      ? files.comprovante.name
                      : "Ver comprovante atual"}{" "}
                    <ExternalLink size={11} />
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => comprovanteRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/25 bg-background/80 px-4 py-3 text-sm font-medium text-muted-foreground transition hover:border-primary hover:text-primary"
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
          </section>

          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-border/70 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>

        {modo === "editar" && (
          <div className="mx-6 mb-6 mt-2 rounded-xl border border-red-500 p-6 md:mx-8">
            <h3 className="mb-2 text-xl font-bold text-red-600">
              Zona de Perigo
            </h3>
            <p className="mb-6 text-sm text-muted-foreground">
              Ao excluir este negócio, todos os dados, imagens e informações
              serão permanentemente removidos. Esta ação não pode ser desfeita.
            </p>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="rounded-md border border-red-500 bg-background px-6 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-600 hover:text-white"
              >
                Excluir Negócio
              </button>
            </div>
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-background p-6 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-foreground">
                Você tem certeza?
              </h3>
              <p className="mb-6 text-sm text-muted-foreground">
                Esta ação é irreversível. O negócio{" "}
                <strong>{form.nome || "selecionado"}</strong> será excluído
                permanentemente da plataforma.
              </p>

              <div className="flex w-full gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
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
