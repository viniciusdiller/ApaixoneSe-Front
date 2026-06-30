"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { servicoTuristaApi } from "@/lib/api"; 
import { PerfilFormField } from "@/components/perfil/forms/PerfilFormField";
import { FileUploadField } from "@/components/admin/FileUploadField";
import { safeMediaUrl } from "@/lib/safeMediaUrl";
import { maskCnpj, maskPhone, numericInputProps } from "@/lib/masks";
import { FileText, ExternalLink, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

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

const REQUER_COMPROVANTE = ["GUIA_TURISMO", "AGENCIA_TURISMO", "LOCADORA_VEICULOS"];

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

export function FormularioServico({ modo, estabelecimentoId, dadosIniciais }: FormularioServicoProps) {
  const router = useRouter();
  
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState<{ logo?: File; foto?: File; comprovante?: File }>({});
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

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | string) => {
    const value = typeof e === "string" ? e : e.target.value;
    setForm((prev) => ({ ...prev, [k]: value }));
  };
  const setField = (k: string, value: string) => setForm((prev) => ({ ...prev, [k]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validação do Comprovante
    const precisaComprovante = REQUER_COMPROVANTE.includes(form.tipo);
    if (precisaComprovante && !dadosIniciais?.comprovanteUrl && !files.comprovante) {
      setError("O comprovante Cadastur é obrigatório para este tipo de serviço.");
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
        toast.success("Atualizado com sucesso!");
      } else {
        await servicoTuristaApi.create(fd);
        toast.success("Enviado para análise com sucesso!");
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
      toast.success("Serviço excluido com sucesso!")
      setShowDeleteModal(false);
      router.push("/perfil");
    } catch (err) {
      toast.success("Erro ao excluir o serviço.");
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const requerComprovante = REQUER_COMPROVANTE.includes(form.tipo);
  const comprovanteExistente = dadosIniciais?.comprovanteUrl ?? null;
  const comprovantePreviewUrl = files.comprovante ? URL.createObjectURL(files.comprovante) : safeMediaUrl(comprovanteExistente);

  return (
    <>
      <div className="max-w-2xl mx-auto p-6 bg-card rounded-xl border border-border shadow-sm">
        <h2 className="text-2xl font-bold mb-6">
          {modo === "criar" ? "Cadastrar em Serviço para o Turista" : "Gerenciar Serviço"}
        </h2>

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* TIPO */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">TIPO *</label>
            <select
              value={form.tipo}
              onChange={set("tipo")}
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            >
              {TIPOS_SERVICO.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* NOME e TELEFONE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PerfilFormField label="NOME" value={form.nome} onChange={set("nome")} required />
            <PerfilFormField label="TELEFONE" value={form.telefone} onChange={set("telefone")} mask={maskPhone} maxLength={15} {...numericInputProps} required />
          </div>

          {/* INSTAGRAM e IDIOMAS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PerfilFormField label="INSTAGRAM" value={form.instagram} onChange={set("instagram")} />
            <PerfilFormField label="IDIOMAS" value={form.idiomas} onChange={set("idiomas")} />
          </div>
          
          {/* ENDEREÇO */}
          <PerfilFormField label="ENDEREÇO" value={form.endereco} onChange={set("endereco")} />
          
          {/* CNPJ */}
          <PerfilFormField label="CNPJ" value={form.cnpj} onChange={set("cnpj")} mask={maskCnpj} maxLength={18} {...numericInputProps} />
          
          {/* SITE */}
          <PerfilFormField label="SITE" value={form.site} onChange={set("site")} />

          {/* DESCRIÇÃO */}
          <PerfilFormField label="DESCRIÇÃO" value={form.descricao} onChange={set("descricao")} multiline rows={4} />

          {/* ROTEIRO */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">ROTEIRO (OPCIONAL)</label>
            <select
              value={form.roteiro}
              onChange={set("roteiro")}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            >
              <option value="">Nenhum</option>
              {ROTEIROS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* LOGO e FOTO DO SERVIÇO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border mt-6">
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

          {/* AQUI ESTÁ O COMPROVANTE! */}
          {requerComprovante && (
            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText size={13} /> Comprovante Cadastur
              </p>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Arquivo {!comprovanteExistente && <span className="text-red-500">*</span>} — PDF ou imagem
                </label>
                {comprovantePreviewUrl && (
                  <div className="mt-1 mb-2">
                    <a href={comprovantePreviewUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-primary font-medium">
                      <FileText size={14} /> {files.comprovante ? files.comprovante.name : "Ver Cadastur atual"} <ExternalLink size={12} />
                    </a>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => comprovanteRef.current?.click()}
                  className="flex items-center gap-2 rounded-md border border-dashed border-border bg-muted/20 px-3 py-2 text-xs font-medium text-muted-foreground transition hover:border-primary hover:text-primary"
                >
                  <FileText size={14} /> {comprovanteExistente || files.comprovante ? "Substituir Arquivo" : "Selecionar arquivo"}
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

          {error && <p className="text-sm font-medium text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
          
          <div className="flex justify-end gap-3 pt-6 border-t border-border">
            <button type="button" onClick={() => router.back()} className="px-5 py-2.5 text-sm font-semibold border rounded-lg transition hover:bg-muted text-foreground">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="px-5 py-2.5 text-sm font-bold text-white bg-primary rounded-lg transition hover:bg-primary/90 disabled:opacity-50">
              {saving ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>

        {/* ZONA DE PERIGO */}
        {modo === "editar" && (
          <div className="mt-12 rounded-xl border border-red-500 p-6">
            <h3 className="text-xl font-bold text-red-600 mb-2">Zona de Perigo</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Ao excluir este serviço, todos os dados, imagens e informações serão permanentemente removidos. Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="px-6 py-2.5 text-sm font-semibold text-red-600 bg-background border border-red-500 rounded-md transition hover:bg-red-600 hover:text-white"
              >
                Excluir Serviço
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
              <h3 className="text-xl font-bold mb-2 text-foreground">Você tem certeza?</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Esta ação é irreversível. O serviço <strong>{form.nome || "selecionado"}</strong> será excluído permanentemente.
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