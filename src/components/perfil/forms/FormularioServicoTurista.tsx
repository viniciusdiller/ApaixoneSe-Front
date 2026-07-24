"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { servicoTuristaApi } from "@/lib/api";
import { PerfilFormField } from "@/components/perfil/forms/PerfilFormField";
import { FileUploadField } from "@/components/admin/FileUploadField";
import { safeMediaUrl } from "@/lib/safeMediaUrl";
import { maskCnpj, maskPhone, numericInputProps } from "@/lib/masks";
import {
  FileText,
  ExternalLink,
  AlertTriangle,
  Sparkles,
  Compass,
  MapPin,
  Phone,
  Instagram,
  Globe,
  Languages,
  Building2,
  AlignLeft,
  Route,
  Trash2,
} from "lucide-react";

interface FormularioServicoProps {
  modo: "criar" | "editar";
  estabelecimentoId?: string;
  dadosIniciais?: any;
}

const TIPOS_SERVICO = [
  { value: "GUIA_TURISMO", label: "Guia de Turismo" },
  { value: "AGENCIA_TURISMO", label: "Agência de Turismo" },
  { value: "ESPORTE_LAZER", label: "Esporte e Lazer" },
  { value: "LOCADORA_VEICULOS", label: "Locadora de Veículos" },
];

const ROTEIROS = [
  { value: "A_PE", label: "A Pé" },
  { value: "ESPORTE_E_AVENTURA", label: "Esporte e Aventura" },
  { value: "DE_PRAIAS", label: "De Praias" },
  { value: "CULTURAL", label: "Cultural" },
  { value: "RELIGIOSO", label: "Religioso" },
  { value: "RURAL", label: "Rural" },
  { value: "ECOLOGICO", label: "Ecológico" },
];

const REQUER_COMPROVANTE = [
  "GUIA_TURISMO",
  "AGENCIA_TURISMO",
  "LOCADORA_VEICULOS",
];

const emptyForm = {
  tipo: "GUIA_TURISMO",
  nome: "",
  telefone: "",
  endereco: "",
  descricao: "",
  cnpj: "",
  instagram: "",
  site: "",
  idiomas: "",
  roteiro: "",
  logoUrl: "",
  fotoUrl: "",
};

export function FormularioServico({
  modo,
  estabelecimentoId,
  dadosIniciais,
}: FormularioServicoProps) {
  const router = useRouter();

  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState<{
    logo?: File;
    foto?: File;
    comprovante?: File;
  }>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const comprovanteRef = useRef<HTMLInputElement>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (modo === "editar" && dadosIniciais) {
      setForm({
        tipo: dadosIniciais.tipo ?? "GUIA_TURISMO",
        nome: dadosIniciais.nome ?? "",
        telefone: dadosIniciais.telefone ?? "",
        endereco: dadosIniciais.endereco ?? "",
        descricao: dadosIniciais.descricao ?? "",
        cnpj: dadosIniciais.cnpj ?? "",
        instagram: dadosIniciais.instagram ?? "",
        site: dadosIniciais.site ?? "",
        idiomas: dadosIniciais.idiomas ?? "",
        roteiro: dadosIniciais.roteiro ?? "",
        logoUrl: dadosIniciais.logoUrl ?? "",
        fotoUrl: dadosIniciais.fotoUrl ?? "",
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const precisaComprovante = REQUER_COMPROVANTE.includes(form.tipo);
    if (
      precisaComprovante &&
      !dadosIniciais?.comprovanteUrl &&
      !files.comprovante
    ) {
      setError(
        "O comprovante Cadastur é obrigatório para este tipo de serviço.",
      );
      return;
    }

    setSaving(true);

    try {
      const fd = new FormData();
      fd.append("tipo", form.tipo);
      fd.append("nome", form.nome);
      fd.append("telefone", form.telefone);
      if (form.endereco) fd.append("endereco", form.endereco);
      if (form.descricao) fd.append("descricao", form.descricao);
      if (form.cnpj) fd.append("cnpj", form.cnpj);
      if (form.instagram) fd.append("instagram", form.instagram);
      if (form.site) fd.append("site", form.site);
      if (form.idiomas) fd.append("idiomas", form.idiomas);
      if (form.roteiro) fd.append("roteiro", form.roteiro);

      if (files.logo) fd.append("logo", files.logo);
      if (files.foto) fd.append("foto", files.foto);
      if (files.comprovante) fd.append("comprovante", files.comprovante);

      if (modo === "editar" && estabelecimentoId) {
        await servicoTuristaApi.update(estabelecimentoId, fd);
        alert("Atualizado com sucesso!");
      } else {
        await servicoTuristaApi.create(fd);
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
      await servicoTuristaApi.delete(estabelecimentoId);
      setShowDeleteModal(false);
      router.push("/perfil");
    } catch (err) {
      alert("Erro ao excluir o serviço.");
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const requerComprovante = REQUER_COMPROVANTE.includes(form.tipo);
  const comprovanteExistente = dadosIniciais?.comprovanteUrl ?? null;
  const comprovantePreviewUrl = files.comprovante
    ? URL.createObjectURL(files.comprovante)
    : safeMediaUrl(comprovanteExistente);

  return (
    <>
      <div className="mx-auto max-w-3xl overflow-hidden rounded-[28px] border border-border/70 bg-card shadow-xl shadow-black/5">

        {/* ── Cabeçalho com identidade visual ── */}
        <div className="relative overflow-hidden border-b border-border/70">
          {/* Faixa de cor com onda decorativa */}
          <div className="relative bg-primary px-6 pb-10 pt-8 md:px-8">
            {/* Gradiente radial decorativo */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 80% 50%, rgba(218,113,1,0.25) 0%, transparent 55%), radial-gradient(circle at 10% 80%, rgba(255,255,255,0.06) 0%, transparent 40%)",
              }}
            />

            {/* Onda decorativa */}
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

            <div className="relative z-10 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary-foreground/80">
                  <Sparkles className="h-3.5 w-3.5" />
                  Solicitação de serviço · Saquarema
                </div>
                <h2 className="font-display text-3xl font-bold uppercase leading-none text-primary-foreground drop-shadow-sm md:text-4xl">
                  {modo === "criar" ? "Cadastrar Novo Serviço" : "Gerenciar Serviço"}
                </h2>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-primary-foreground/70">
                  {modo === "criar"
                    ? "Preencha os dados abaixo para submeter seu serviço turístico à análise da equipe."
                    : "Atualize as informações do seu serviço cadastrado em Saquarema."}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-2 text-sm text-primary-foreground/80">
                <Compass className="h-5 w-5" />
                <span className="hidden md:inline">Serviços Turísticos</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-8 px-6 py-8 md:px-8">

          {/* ── Bloco 1: Dados Principais ── */}
          <section className="space-y-5">
            <div className="flex items-center gap-3 pb-1">
              <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
              <p className="shrink-0 text-xs font-bold uppercase tracking-[0.28em] text-primary">
                Dados do Serviço
              </p>
              <div className="h-px flex-1 bg-gradient-to-l from-primary/30 to-transparent" />
            </div>

            {/* Tipo */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Building2 className="h-3.5 w-3.5 text-primary" />
                TIPO *
              </label>
              <select
                value={form.tipo}
                onChange={set("tipo")}
                required
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                {TIPOS_SERVICO.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Nome + Telefone */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <PerfilFormField
                label="NOME"
                value={form.nome}
                onChange={set("nome")}
                placeholder="Ex: Surf Experience Saquarema"
                required
              />
              <PerfilFormField
                label="TELEFONE"
                value={form.telefone}
                onChange={set("telefone")}
                placeholder="(21) 99999-9999"
                mask={maskPhone}
                maxLength={15}
                {...numericInputProps}
                required
              />
            </div>

            {/* Instagram + Idiomas */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <PerfilFormField
                label="INSTAGRAM"
                value={form.instagram}
                onChange={set("instagram")}
                placeholder="@seuservico"
              />
              <PerfilFormField
                label="IDIOMAS"
                value={form.idiomas}
                onChange={set("idiomas")}
                placeholder="Ex: Português, Inglês, Espanhol"
              />
            </div>

            {/* Endereço */}
            <PerfilFormField
              label="ENDEREÇO"
              value={form.endereco}
              onChange={set("endereco")}
              placeholder="Rua, número, bairro — Saquarema, RJ"
            />

            {/* CNPJ */}
            <PerfilFormField
              label="CNPJ"
              value={form.cnpj}
              onChange={set("cnpj")}
              placeholder="00.000.000/0001-00"
              mask={maskCnpj}
              maxLength={18}
              {...numericInputProps}
            />

            {/* Site */}
            <PerfilFormField
              label="SITE"
              value={form.site}
              onChange={set("site")}
              placeholder="www.seusite.com.br"
            />

            {/* Descrição */}
            <PerfilFormField
              label="DESCRIÇÃO"
              value={form.descricao}
              onChange={set("descricao")}
              placeholder="Descreva seu serviço, diferenciais e o que o turista pode esperar..."
              multiline
              rows={4}
            />

            {/* Roteiro */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Route className="h-3.5 w-3.5 text-primary" />
                ROTEIRO (OPCIONAL)
              </label>
              <select
                value={form.roteiro}
                onChange={set("roteiro")}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Nenhum</option>
                {ROTEIROS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* ── Bloco 2: Identidade Visual ── */}
          <section className="space-y-5 rounded-[24px] border border-border/70 bg-background/60 p-5 md:p-6">
            <div className="flex items-center gap-3 pb-1">
              <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
              <p className="shrink-0 text-xs font-bold uppercase tracking-[0.28em] text-primary">
                Identidade Visual
              </p>
              <div className="h-px flex-1 bg-gradient-to-l from-primary/30 to-transparent" />
            </div>

            <div className="grid grid-cols-1 gap-6 pt-1 md:grid-cols-2">
              <FileUploadField
                label="LOGO *"
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

              <FileUploadField
                label="FOTO DO SERVIÇO"
                accept="image"
                currentUrl={form.fotoUrl}
                hint="PNG, JPG ou WEBP"
                onFileChange={(url, file) => {
                  setField("fotoUrl", url);
                  setFiles((p) => ({ ...p, foto: file }));
                }}
                onClear={() => {
                  setField("fotoUrl", "");
                  setFiles((p) => ({ ...p, foto: undefined }));
                }}
              />
            </div>

            {/* Comprovante Cadastur */}
            {requerComprovante && (
              <div className="rounded-[22px] border border-dashed border-primary/25 bg-[linear-gradient(135deg,rgba(1,105,111,0.05),rgba(218,113,1,0.04))] p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Comprovante Cadastur
                  </p>
                  {!comprovanteExistente && (
                    <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                      Obrigatório
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Arquivo{" "}
                    {!comprovanteExistente && (
                      <span className="text-red-500">*</span>
                    )}{" "}
                    — PDF ou imagem
                  </label>

                  {comprovantePreviewUrl && (
                    <div className="mb-2 mt-1">
                      <a
                        href={comprovantePreviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
                      >
                        <FileText size={14} />{" "}
                        {files.comprovante
                          ? files.comprovante.name
                          : "Ver Cadastur atual"}{" "}
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => comprovanteRef.current?.click()}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/25 bg-background/80 px-4 py-3 text-sm font-medium text-muted-foreground transition hover:border-primary hover:text-primary"
                  >
                    <FileText size={14} />{" "}
                    {comprovanteExistente || files.comprovante
                      ? "Substituir Arquivo"
                      : "Selecionar arquivo"}
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
            )}
          </section>

          {/* ── Erro ── */}
          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* ── Ações ── */}
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
              className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:opacity-50"
            >
              {saving
                ? "Salvando..."
                : modo === "criar"
                ? "Enviar para Análise"
                : "Salvar Alterações"}
            </button>
          </div>
        </form>

        {/* ── Zona de Perigo ── */}
        {modo === "editar" && (
          <div className="mx-6 mb-8 mt-2 overflow-hidden rounded-2xl border border-red-200 md:mx-8">
            <div className="flex items-center gap-3 border-b border-red-200 bg-red-50 px-5 py-3">
              <Trash2 className="h-4 w-4 text-red-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-red-600">
                Zona de Perigo
              </h3>
            </div>
            <div className="px-5 py-4">
              <p className="mb-4 text-sm text-muted-foreground">
                Ao excluir este serviço, todos os dados, imagens e informações
                serão permanentemente removidos. Esta ação não pode ser desfeita.
              </p>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="rounded-xl border border-red-300 bg-background px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-600 hover:text-white"
              >
                Excluir Serviço
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal de Confirmação de Exclusão ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-background p-6 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-foreground">
                Você tem certeza?
              </h3>
              <p className="mb-6 text-sm text-muted-foreground">
                Esta ação é irreversível. O serviço{" "}
                <strong>{form.nome || "selecionado"}</strong> será excluído
                permanentemente.
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
