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
  UtensilsCrossed,
  ArrowLeft,
  Trash2,
  Building2,
  User,
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

        {/* ── Cabeçalho branded ── */}
        <div className="relative overflow-hidden border-b border-border/70">
          <div className="relative bg-primary px-6 pb-10 pt-8 md:px-8">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 80% 50%, rgba(218,113,1,0.25) 0%, transparent 55%), radial-gradient(circle at 10% 80%, rgba(255,255,255,0.06) 0%, transparent 40%)",
              }}
            />
            <svg
              aria-hidden
              className="absolute bottom-0 left-0 w-full"
              viewBox="0 0 1440 40"
              preserveAspectRatio="none"
              style={{ height: 36 }}
            >
              <path
                d="M0,20 C240,40 480,0 720,20 C960,40 1200,0 1440,20 L1440,40 L0,40 Z"
                fill="hsl(var(--card))"
              />
            </svg>

            <div className="relative z-10">
              {/* Botão Voltar */}
              <button
                type="button"
                onClick={() => router.back()}
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 text-xs font-semibold text-primary-foreground/80 transition hover:bg-primary-foreground/20 hover:text-primary-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Voltar
              </button>

              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary-foreground/80">
                    <Sparkles className="h-3.5 w-3.5" />
                    Solicitação de estabelecimento · Saquarema
                  </div>
                  <h2 className="font-display text-3xl font-bold uppercase leading-none text-primary-foreground drop-shadow-sm md:text-4xl">
                    {modo === "criar" ? "Cadastrar Novo Estabelecimento" : "Gerenciar Estabelecimento"}
                  </h2>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-primary-foreground/70">
                    {modo === "criar"
                      ? "Preencha os dados abaixo para submeter seu estabelecimento à análise da equipe."
                      : "Atualize as informações do seu estabelecimento cadastrado em Saquarema."}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-2 text-sm text-primary-foreground/80">
                  <UtensilsCrossed className="h-5 w-5" />
                  <span className="hidden md:inline">Gastronomia</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-8 px-6 py-8 md:px-8">

          {/* ── Bloco 1: Dados do Negócio ── */}
          <section className="space-y-5">
            <div className="flex items-center gap-3 pb-1">
              <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
              <p className="shrink-0 text-xs font-bold uppercase tracking-[0.28em] text-primary">Dados do Negócio</p>
              <div className="h-px flex-1 bg-gradient-to-l from-primary/30 to-transparent" />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <PerfilFormField label="Nome" value={form.nome} onChange={set("nome")} placeholder="Ex: Restaurante Mar Aberto" required />
              <PerfilFormField label="Telefone" value={form.telefone} onChange={set("telefone")} placeholder="(21) 99999-9999" mask={maskPhone} maxLength={15} {...numericInputProps} required />
            </div>

            <PerfilFormField label="Endereço" value={form.endereco} onChange={set("endereco")} placeholder="Rua, número, bairro — Saquarema, RJ" required />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <PerfilFormField label="Especialidade" value={form.especialidade} onChange={set("especialidade")} placeholder="Ex: Frutos do Mar, Churrasco, Vegano..." />
              <PerfilFormField label="CNPJ" value={form.cnpj} onChange={set("cnpj")} placeholder="00.000.000/0001-00" mask={maskCnpj} maxLength={18} {...numericInputProps} required />
            </div>
          </section>

          {/* ── Bloco 2: Responsável Legal ── */}
          <section className="space-y-5 rounded-[24px] border border-border/70 bg-background/60 p-5 md:p-6">
            <div className="flex items-center gap-3 pb-1">
              <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
              <p className="shrink-0 text-xs font-bold uppercase tracking-[0.28em] text-primary">Responsável Legal</p>
              <div className="h-px flex-1 bg-gradient-to-l from-primary/30 to-transparent" />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <PerfilFormField label="Responsável (Nome)" value={form.responsavelNome} onChange={set("responsavelNome")} placeholder="Nome completo do responsável" mask={maskPersonName} required />
              <PerfilFormField label="Responsável (CPF)" value={form.responsavelCpf} onChange={set("responsavelCpf")} placeholder="000.000.000-00" mask={maskCpf} maxLength={14} {...numericInputProps} required />
            </div>

            <PerfilFormField label="Instagram" value={form.instagram} onChange={set("instagram")} placeholder="@seurestaurante" />
          </section>

          {/* ── Bloco 3: Arquivos ── */}
          <section className="space-y-5 rounded-[24px] border border-border/70 bg-background/60 p-5 md:p-6">
            <div className="flex items-center gap-3 pb-1">
              <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
              <p className="shrink-0 text-xs font-bold uppercase tracking-[0.28em] text-primary">Identidade Visual e Comprovação</p>
              <div className="h-px flex-1 bg-gradient-to-l from-primary/30 to-transparent" />
            </div>

            <FileUploadField label="Logo do Estabelecimento" accept="image" currentUrl={form.logoUrl} required={modo === "criar"} hint="PNG, JPG ou WEBP"
              onFileChange={(url, file) => { setField("logoUrl", url); setFiles((p) => ({ ...p, logo: file })); }}
              onClear={() => { setField("logoUrl", ""); setFiles((p) => ({ ...p, logo: undefined })); }}
            />

            <div className="rounded-[22px] border border-dashed border-primary/25 bg-[linear-gradient(135deg,rgba(1,105,111,0.05),rgba(218,113,1,0.04))] p-5 space-y-4">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <FileText size={13} /> Comprovante (PDF ou Imagem)
              </p>
              <div className="space-y-2">
                {comprovantePreviewUrl && (
                  <a href={comprovantePreviewUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                    <FileText size={12} /> {files.comprovante ? files.comprovante.name : "Ver comprovante atual"} <ExternalLink size={11} />
                  </a>
                )}
                <button type="button" onClick={() => comprovanteRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/25 bg-background/80 px-4 py-3 text-sm font-medium text-muted-foreground transition hover:border-primary hover:text-primary">
                  <FileText size={14} /> Selecionar arquivo
                </button>
                <input ref={comprovanteRef} type="file" accept="application/pdf,image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) setFiles((p) => ({ ...p, comprovante: f })); }}
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
            <button type="button" onClick={() => router.back()}
              className="rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted">Cancelar</button>
            <button type="submit" disabled={saving}
              className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:opacity-50">
              {saving ? "Salvando..." : modo === "criar" ? "Enviar para Análise" : "Salvar Alterações"}
            </button>
          </div>
        </form>

        {modo === "editar" && (
          <div className="mx-6 mb-8 mt-2 overflow-hidden rounded-2xl border border-red-200 md:mx-8">
            <div className="flex items-center gap-3 border-b border-red-200 bg-red-50 px-5 py-3">
              <Trash2 className="h-4 w-4 text-red-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-red-600">Zona de Perigo</h3>
            </div>
            <div className="px-5 py-4">
              <p className="mb-4 text-sm text-muted-foreground">
                Ao excluir este negócio, todos os dados, imagens e informações serão permanentemente removidos. Esta ação não pode ser desfeita.
              </p>
              <button type="button" onClick={() => setShowDeleteModal(true)}
                className="rounded-xl border border-red-300 bg-background px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-600 hover:text-white">
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
              <h3 className="mb-2 text-xl font-bold text-foreground">Você tem certeza?</h3>
              <p className="mb-6 text-sm text-muted-foreground">
                Esta ação é irreversível. O negócio <strong>{form.nome || "selecionado"}</strong> será excluído permanentemente da plataforma.
              </p>
              <div className="flex w-full gap-3">
                <button type="button" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}
                  className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted disabled:opacity-50">Cancelar</button>
                <button type="button" onClick={handleDelete} disabled={isDeleting}
                  className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50">
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
