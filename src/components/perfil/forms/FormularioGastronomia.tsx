"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { gastronomiaApi } from "@/lib/api";
import { PerfilFormField } from "@/components/perfil/forms/PerfilFormField";
import { FileUploadField } from "@/components/admin/FileUploadField";
import { safeMediaUrl } from "@/lib/safeMediaUrl";
import { FileText, ExternalLink, AlertTriangle } from "lucide-react"; // <-- Importamos o AlertTriangle

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

export function FormularioGastronomia({ modo, estabelecimentoId, dadosIniciais }: FormularioGastronomiaProps) {
  const router = useRouter();
  
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState<{ logo?: File; comprovante?: File }>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const comprovanteRef = useRef<HTMLInputElement>(null);

  // --- NOVOS ESTADOS PARA O MODAL DE EXCLUSÃO ---
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

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | string) => {
    const value = typeof e === "string" ? e : e.target.value;
    setForm((prev) => ({ ...prev, [k]: value }));
  };
  const setField = (k: string, value: string) => setForm((prev) => ({ ...prev, [k]: value }));

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

  // --- FUNÇÃO PARA DELETAR DE FATO ---
  const handleDelete = async () => {
    if (!estabelecimentoId) return;
    setIsDeleting(true);
    try {
      await gastronomiaApi.delete(estabelecimentoId);
      setShowDeleteModal(false);
      router.push("/perfil"); // Retorna ao perfil após excluir
    } catch (err) {
      alert("Erro ao excluir o estabelecimento.");
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const comprovanteExistente = dadosIniciais?.documentoPdfUrl ?? null;
  const comprovantePreviewUrl = files.comprovante ? URL.createObjectURL(files.comprovante) : safeMediaUrl(comprovanteExistente);

  return (
    <>
      <div className="max-w-2xl mx-auto p-6 bg-card rounded-xl border border-border shadow-sm">
        <h2 className="text-2xl font-bold mb-6">
          {modo === "criar" ? "Cadastrar Novo Estabelecimento" : "Gerenciar Estabelecimento"}
        </h2>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PerfilFormField label="Nome" value={form.nome} onChange={set("nome")} required />
            <PerfilFormField label="Telefone" value={form.telefone} onChange={set("telefone")} required />
          </div>
          
          <PerfilFormField label="Endereço" value={form.endereco} onChange={set("endereco")} required />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PerfilFormField label="Especialidade" value={form.especialidade} onChange={set("especialidade")} />
            <PerfilFormField label="CNPJ" value={form.cnpj} onChange={set("cnpj")} required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PerfilFormField label="Responsável (Nome)" value={form.responsavelNome} onChange={set("responsavelNome")} required />
            <PerfilFormField label="Responsável (CPF)" value={form.responsavelCpf} onChange={set("responsavelCpf")} required />
          </div>
          
          <PerfilFormField label="Instagram" value={form.instagram} onChange={set("instagram")} />

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

          <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FileText size={13} /> Comprovante (PDF ou Imagem)
            </p>
            <div className="space-y-2">
              {comprovantePreviewUrl && (
                <a href={comprovantePreviewUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-primary">
                  <FileText size={12} /> {files.comprovante ? files.comprovante.name : "Ver comprovante atual"} <ExternalLink size={11} />
                </a>
              )}
              <button
                type="button"
                onClick={() => comprovanteRef.current?.click()}
                className="flex items-center gap-2 rounded-md border border-dashed border-border bg-muted/20 px-3 py-2 text-xs text-muted-foreground transition hover:border-primary hover:text-primary"
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

          {error && <p className="text-sm text-red-500">{error}</p>}
          
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => router.back()} className="px-4 py-2 text-sm border rounded-md transition hover:bg-muted">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm text-white bg-primary rounded-md transition hover:bg-primary/90 disabled:opacity-50">
              {saving ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>

        {/* =========================================
            ZONA DE PERIGO (Somente se for Edição)
            ========================================= */}
        {modo === "editar" && (
          <div className="mt-12 rounded-xl border border-red-500 p-6">
            <h3 className="text-xl font-bold text-red-600 mb-2">
              Zona de Perigo
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Ao excluir este negócio, todos os dados, imagens e informações serão permanentemente removidos. Esta ação não pode ser desfeita.
            </p>
            
            {/* Div apenas para centralizar o botão */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="px-6 py-2.5 text-sm font-semibold text-red-600 bg-background border border-red-500 rounded-md transition hover:bg-red-600 hover:text-white"
              >
                Excluir Negócio
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =========================================
          MODAL DE CONFIRMAÇÃO (Overlay com Blur)
          ========================================= */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-background rounded-2xl shadow-xl max-w-sm w-full p-6 border border-border animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">Você tem certeza?</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Esta ação é irreversível. O estabelecimento <strong>{form.nome || "selecionado"}</strong> será excluído permanentemente da plataforma.
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