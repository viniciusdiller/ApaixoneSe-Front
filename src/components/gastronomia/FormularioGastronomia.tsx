"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { gastronomiaApi } from "@/lib/api";
import { AdminFormField } from "@/components/admin/AdminFormField";
import { FileUploadField } from "@/components/admin/FileUploadField";
import { safeMediaUrl } from "@/lib/safeMediaUrl";
import { FileText, ExternalLink } from "lucide-react";

// Suas interfaces para saber se é criação ou edição
interface FormularioGastronomiaProps {
  modo: "criar" | "editar";
  estabelecimentoId?: string;
  dadosIniciais?: any; // Aqui você passaria o objeto Gastronomia se fosse editar
}

export function FormularioGastronomia({ modo, estabelecimentoId, dadosIniciais }: FormularioGastronomiaProps) {
  const router = useRouter();
  
  // 1. REAPROVEITADO: O estado do formulário (já puxando os dados caso seja edição)
  const [form, setForm] = useState({
    nome: dadosIniciais?.nome || "",
    telefone: dadosIniciais?.telefone || "",
    endereco: dadosIniciais?.endereco || "",
    especialidade: dadosIniciais?.especialidade || "",
    cnpj: dadosIniciais?.cnpj || "",
    responsavelNome: dadosIniciais?.responsavelNome || "",
    responsavelCpf: dadosIniciais?.responsavelCpf || "",
    instagram: dadosIniciais?.instagram || "",
    logoUrl: dadosIniciais?.logoUrl || "",
  });

  const [files, setFiles] = useState<{ logo?: File; comprovante?: File }>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const comprovanteRef = useRef<HTMLInputElement>(null);

  // 2. REAPROVEITADO: O set() e setField() que você já usava
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | string) => {
    const value = typeof e === "string" ? e : e.target.value;
    setForm((prev) => ({ ...prev, [k]: value }));
  };
  const setField = (k: string, value: string) => setForm((prev) => ({ ...prev, [k]: value }));

  // 3. ADAPTADO: O seu handleSave limpo (sem validade e sem closeModal)
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
      
      // Redireciona o usuário para o perfil dele
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

  const comprovanteExistente = dadosIniciais?.documentoPdfUrl ?? null;
  const comprovantePreviewUrl = files.comprovante ? URL.createObjectURL(files.comprovante) : safeMediaUrl(comprovanteExistente);

  return (
    // Em vez de estar dentro de um <AdminModal>, é só uma <div> normal na página
    <div className="max-w-2xl mx-auto p-6 bg-card rounded-xl border border-border shadow-sm">
      <h2 className="text-2xl font-bold mb-6">
        {modo === "criar" ? "Cadastrar Novo Estabelecimento" : "Editar Estabelecimento"}
      </h2>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 4. REAPROVEITADO: A grade exata de inputs que você usou no Admin */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminFormField label="Nome" value={form.nome} onChange={set("nome")} required />
          <AdminFormField label="Telefone" value={form.telefone} onChange={set("telefone")} required />
        </div>
        
        <AdminFormField label="Endereço" value={form.endereco} onChange={set("endereco")} required />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminFormField label="Especialidade" value={form.especialidade} onChange={set("especialidade")} />
          <AdminFormField label="CNPJ" value={form.cnpj} onChange={set("cnpj")} required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminFormField label="Responsável (Nome)" value={form.responsavelNome} onChange={set("responsavelNome")} required />
          <AdminFormField label="Responsável (CPF)" value={form.responsavelCpf} onChange={set("responsavelCpf")} required />
        </div>
        
        <AdminFormField label="Instagram" value={form.instagram} onChange={set("instagram")} />

        {/* Upload da Logo */}
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

        {/* Upload do Comprovante (Copiado do seu código, mas sem a parte da data de validade) */}
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
          <button type="button" onClick={() => router.push("/perfil")} className="px-4 py-2 text-sm border rounded-md">
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm text-white bg-primary rounded-md disabled:opacity-50">
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}