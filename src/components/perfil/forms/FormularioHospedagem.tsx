"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { hospedagemApi } from "@/lib/api";
import { PerfilFormField } from "@/components/perfil/forms/PerfilFormField";
import { FileUploadField } from "@/components/admin/FileUploadField";
import { safeMediaUrl } from "@/lib/safeMediaUrl";
import {
  FileText,
  ExternalLink,
  AlertTriangle,
  Bed,
  User,
  FileCheck2,
  Send,
  CheckCircle2,
  Trash2,
  X,
} from "lucide-react";
import { maskCnpj, maskCpf, maskPersonName, maskPhone, numericInputProps } from "@/lib/masks";

interface FormularioHospedagemProps {
  modo: "criar" | "editar";
  estabelecimentoId?: string;
  dadosIniciais?: any;
}

const emptyForm = {
  nome: "",
  telefone: "",
  endereco: "",
  tipo: "",
  cnpj: "",
  responsavelNome: "",
  responsavelCpf: "",
  instagram: "",
  logoUrl: "",
  capacidade: "",
  descricao: "",
  checkIn: "",
  checkOut: "",
};

const TIPOS_HOSPEDAGEM = [
  "Pousada",
  "Hotel",
  "Hostel",
  "Camping",
  "Casa de Temporada",
  "Resort",
  "Outro",
];

export function FormularioHospedagem({ modo, estabelecimentoId, dadosIniciais }: FormularioHospedagemProps) {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState<{ logo?: File; comprovante?: File }>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const comprovanteRef = useRef<HTMLInputElement>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (modo === "editar" && dadosIniciais) {
      setForm({
        nome: dadosIniciais.nome ?? "",
        telefone: dadosIniciais.telefone ?? "",
        endereco: dadosIniciais.endereco ?? "",
        tipo: dadosIniciais.tipo ?? "",
        cnpj: dadosIniciais.cnpj ?? "",
        responsavelNome: dadosIniciais.responsavelNome ?? "",
        responsavelCpf: dadosIniciais.responsavelCpf ?? "",
        instagram: dadosIniciais.instagram ?? "",
        logoUrl: dadosIniciais.logoUrl ?? "",
        capacidade: dadosIniciais.capacidade != null ? String(dadosIniciais.capacidade) : "",
        descricao: dadosIniciais.descricao ?? "",
        checkIn: dadosIniciais.checkIn ?? "",
        checkOut: dadosIniciais.checkOut ?? "",
      });
    } else {
      setForm(emptyForm);
      setFiles({});
    }
  }, [modo, dadosIniciais]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | string) => {
    const value = typeof e === "string" ? e : e.target.value;
    setForm((prev) => ({ ...prev, [k]: value }));
  };
  const setField = (k: string, value: string) => setForm((prev) => ({ ...prev, [k]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("nome", form.nome);
      fd.append("telefone", form.telefone);
      fd.append("endereco", form.endereco);
      if (form.tipo) fd.append("tipo", form.tipo);
      fd.append("cnpj", form.cnpj);
      fd.append("responsavelNome", form.responsavelNome);
      fd.append("responsavelCpf", form.responsavelCpf);
      if (form.instagram) fd.append("instagram", form.instagram);
      if (form.capacidade) fd.append("capacidade", form.capacidade);
      if (form.descricao) fd.append("descricao", form.descricao);
      if (form.checkIn) fd.append("checkIn", form.checkIn);
      if (form.checkOut) fd.append("checkOut", form.checkOut);
      if (files.logo) fd.append("logo", files.logo);
      if (files.comprovante) fd.append("documentoPdf", files.comprovante);

      if (modo === "editar" && estabelecimentoId) {
        await hospedagemApi.update(estabelecimentoId, fd);
        setSuccess("Hospedagem atualizada com sucesso!");
      } else {
        await hospedagemApi.create(fd);
        setSuccess("Solicitação enviada! Em breve nossa equipe analisará seu cadastro.");
      }
      setTimeout(() => router.push("/perfil"), 2000);
    } catch (err: unknown) {
      try {
        const p = JSON.parse((err as Error).message);
        setError(Array.isArray(p.message) ? p.message.join(" ") : p.message);
      } catch {
        setError("Erro ao salvar. Tente novamente.");
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
    } catch {
      setError("Erro ao excluir o estabelecimento.");
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const comprovanteExistente = dadosIniciais?.documentoPdfUrl ?? null;
  const comprovantePreviewUrl = files.comprovante ? URL.createObjectURL(files.comprovante) : safeMediaUrl(comprovanteExistente);

  return (
    <>
      <div className="mx-auto max-w-2xl">
        {/* ── HEADER DO FORMULÁRIO ── */}
        <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-secondary p-6 text-primary-foreground shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Bed className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold uppercase tracking-wide">
                {modo === "criar" ? "Cadastrar Hospedagem" : "Gerenciar Hospedagem"}
              </h2>
              <p className="mt-0.5 text-sm text-white/75">
                {modo === "criar"
                  ? "Preencha os dados abaixo. Nossa equipe analisará e publicará seu negócio."
                  : "Mantenha as informações da sua hospedagem sempre atualizadas."}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* SEÇÃO 1 – DADOS DA HOSPEDAGEM */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2 border-b border-border pb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Bed className="h-4 w-4" />
              </div>
              <h3 className="font-display text-base font-bold uppercase tracking-wide text-foreground">
                Dados da Hospedagem
              </h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <PerfilFormField label="Nome da Hospedagem" value={form.nome} onChange={set("nome")} required placeholder="Ex: Pousada Brisa do Mar" />
                <PerfilFormField label="Telefone" value={form.telefone} onChange={set("telefone")} mask={maskPhone} maxLength={15} {...numericInputProps} required placeholder="(00) 00000-0000" />
              </div>
              <PerfilFormField label="Endereço Completo" value={form.endereco} onChange={set("endereco")} required placeholder="Rua, número, bairro" />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Tipo de Hospedagem
                  </label>
                  <select
                    value={form.tipo}
                    onChange={set("tipo") as any}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                  >
                    <option value="">Selecione...</option>
                    {TIPOS_HOSPEDAGEM.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <PerfilFormField label="Capacidade (hóspedes)" value={form.capacidade} onChange={set("capacidade")} {...numericInputProps} placeholder="Ex: 20" />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <PerfilFormField label="Check-in" value={form.checkIn} onChange={set("checkIn")} placeholder="Ex: 14:00" />
                <PerfilFormField label="Check-out" value={form.checkOut} onChange={set("checkOut")} placeholder="Ex: 12:00" />
              </div>
              <PerfilFormField label="Descrição" value={form.descricao} onChange={set("descricao")} multiline rows={3} placeholder="Descreva o diferencial da sua hospedagem..." />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <PerfilFormField label="CNPJ" value={form.cnpj} onChange={set("cnpj")} mask={maskCnpj} maxLength={18} {...numericInputProps} required placeholder="00.000.000/0000-00" />
                <PerfilFormField label="Instagram" value={form.instagram} onChange={set("instagram")} placeholder="@suapousada" />
              </div>
            </div>
          </div>

          {/* SEÇÃO 2 – RESPONSÁVEL */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2 border-b border-border pb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <User className="h-4 w-4" />
              </div>
              <h3 className="font-display text-base font-bold uppercase tracking-wide text-foreground">
                Dados do Responsável
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <PerfilFormField label="Nome Completo" value={form.responsavelNome} onChange={set("responsavelNome")} mask={maskPersonName} required placeholder="Nome do responsável" />
              <PerfilFormField label="CPF" value={form.responsavelCpf} onChange={set("responsavelCpf")} mask={maskCpf} maxLength={14} {...numericInputProps} required placeholder="000.000.000-00" />
            </div>
          </div>

          {/* SEÇÃO 3 – MÍDIA E DOCUMENTOS */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2 border-b border-border pb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileCheck2 className="h-4 w-4" />
              </div>
              <h3 className="font-display text-base font-bold uppercase tracking-wide text-foreground">
                Mídia e Comprovantes
              </h3>
            </div>

            <div className="space-y-5">
              <FileUploadField
                label="Logo da Hospedagem"
                accept="image"
                currentUrl={form.logoUrl}
                required={modo === "criar"}
                hint="PNG, JPG ou WEBP — tamanho ideal: 500×500px"
                onFileChange={(url, file) => {
                  setField("logoUrl", url);
                  setFiles((p) => ({ ...p, logo: file }));
                }}
                onClear={() => {
                  setField("logoUrl", "");
                  setFiles((p) => ({ ...p, logo: undefined }));
                }}
              />

              <div className="rounded-xl border border-dashed border-border bg-muted/30 p-5 transition-colors hover:border-primary/50">
                <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" /> Comprovante de Endereço ou Contrato Social
                </p>
                {comprovantePreviewUrl ? (
                  <div className="mb-3 flex items-center justify-between rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2">
                    <a href={comprovantePreviewUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-medium text-green-700 hover:underline">
                      <FileCheck2 className="h-3.5 w-3.5" />
                      {files.comprovante ? files.comprovante.name : "Ver comprovante atual"}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    <button type="button" onClick={() => setFiles((p) => ({ ...p, comprovante: undefined }))} className="text-muted-foreground transition hover:text-red-500">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : null}
                <button type="button" onClick={() => comprovanteRef.current?.click()} className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-xs font-medium text-foreground transition hover:border-primary hover:text-primary">
                  <FileText className="h-3.5 w-3.5" />
                  {comprovantePreviewUrl ? "Substituir arquivo" : "Selecionar arquivo"}
                </button>
                <p className="mt-2 text-xs text-muted-foreground">PDF ou imagem, máx. 10 MB</p>
                <input ref={comprovanteRef} type="file" accept="application/pdf,image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setFiles((p) => ({ ...p, comprovante: f })); }} />
              </div>
            </div>
          </div>

          {/* MENSAGENS */}
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* AÇÕES */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button type="button" onClick={() => router.back()} className="flex items-center gap-1.5 rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted">
              Cancelar
            </button>
            <button type="submit" disabled={saving || !!success} className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-60">
              {saving ? (
                <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Salvando...</>
              ) : (
                <><Send className="h-4 w-4" />{modo === "criar" ? "Enviar Solicitação" : "Salvar Alterações"}</>
              )}
            </button>
          </div>
        </form>

        {/* ZONA DE PERIGO */}
        {modo === "editar" && (
          <div className="mt-10 rounded-2xl border border-red-200 bg-red-50/50 p-6">
            <h3 className="mb-1 font-display text-lg font-bold uppercase text-red-700">Zona de Perigo</h3>
            <p className="mb-5 text-sm text-muted-foreground">Ao excluir este negócio, todos os dados e imagens serão removidos permanentemente. Esta ação não pode ser desfeita.</p>
            <button type="button" onClick={() => setShowDeleteModal(true)} className="inline-flex items-center gap-2 rounded-xl border border-red-400 bg-background px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-600 hover:text-white">
              <Trash2 className="h-4 w-4" /> Excluir Negócio
            </button>
          </div>
        )}
      </div>

      {/* MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-7 w-7 text-red-600" />
              </div>
              <h3 className="font-display text-xl font-bold uppercase text-foreground">Confirmar exclusão</h3>
              <p className="mt-2 text-sm text-muted-foreground">O negócio <strong className="text-foreground">{form.nome || "selecionado"}</strong> será excluído permanentemente.</p>
              <div className="mt-6 flex w-full gap-3">
                <button type="button" onClick={() => setShowDeleteModal(false)} disabled={isDeleting} className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted disabled:opacity-50">Cancelar</button>
                <button type="button" onClick={handleDelete} disabled={isDeleting} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50">
                  {isDeleting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Trash2 className="h-4 w-4" />}
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
