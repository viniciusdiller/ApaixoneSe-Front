"use client";

import { X, Globe, Tag, FileText, ExternalLink, Building2 } from "lucide-react";

export type NegocioModal = {
  id: string;
  nome: string;
  endereco?: string | null;
  telefone?: string | null;
  logoUrl?: string | null;
  categoria: "hospedagem" | "gastronomia" | "servico-turista";
  status?: string | null;
  cnpj?: string | null;
  instagram?: string | null;
  site?: string | null;
  responsavelNome?: string | null;
  responsavelCpf?: string | null;
  textoDiferencial?: string | null;
  descricao?: string | null;
  especialidade?: string | null;
  idiomas?: string | null;
  roteiro?: string | null;
  tipo?: string | null;
  tags?: string[] | string | null;
  documentoPdfUrl?: string | null;
  comprovanteUrl?: string | null; // <-- ADICIONAMOS AQUI O CAMPO DE SERVIÇOS
};

interface VisualizacaoModalProps {
  item: NegocioModal;
  onClose: () => void;
}

const Field = ({ label, value, icon: Icon }: { label: string; value?: string | null; icon?: any }) => {
  if (!value) return null;
  return (
    <div>
      <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </p>
      <p className="text-sm font-medium text-foreground whitespace-pre-wrap">{value}</p>
    </div>
  );
};

const getStatusBadge = (status?: string | null) => {
  if (!status) return null;
  const s = status.toUpperCase();
  if (s === "APROVADO") return <span className="rounded-md bg-green-100 px-2 py-1 text-xs font-bold text-green-700">APROVADO</span>;
  if (s === "REJEITADO") return <span className="rounded-md bg-red-100 px-2 py-1 text-xs font-bold text-red-700">REJEITADO</span>;
  return <span className="rounded-md bg-yellow-100 px-2 py-1 text-xs font-bold text-yellow-700">PENDENTE</span>;
};

const renderTags = (tagsRaw?: string[] | string | null) => {
  if (!tagsRaw) return null;
  let tagsArray: string[] = [];
  if (Array.isArray(tagsRaw)) {
    tagsArray = tagsRaw;
  } else {
    try { tagsArray = JSON.parse(tagsRaw); } catch { return null; }
  }
  if (tagsArray.length === 0) return null;

  return (
    <div className="space-y-2 mt-4">
      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        <Tag className="h-3 w-3" /> Comodidades
      </p>
      <div className="flex flex-wrap gap-2">
        {tagsArray.map((t) => (
          <span key={t} className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
};

export function VisualizacaoModal({ item, onClose }: VisualizacaoModalProps) {
  
  // <-- MÁGICA AQUI: Pega o comprovante não importa como o Back-end chame!
  const urlComprovante = item.documentoPdfUrl || item.comprovanteUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl border border-border flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 backdrop-blur px-6 py-4">
          <h2 className="text-base font-bold uppercase tracking-wider text-foreground">
            Detalhes da {item.categoria === "hospedagem" ? "Hospedagem" : item.categoria === "gastronomia" ? "Gastronomia" : "Serviço"}
          </h2>
          <button 
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6 space-y-8">
          
          {/* Logo e Nome */}
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-border bg-muted overflow-hidden">
              {item.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`${process.env.NEXT_PUBLIC_API_URL ?? ""}${item.logoUrl}`} alt="Logo" className="h-full w-full object-contain p-2" />
              ) : (
                <Building2 className="h-8 w-8 text-muted-foreground/50" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-black uppercase text-foreground mb-1.5">{item.nome}</h3>
              {getStatusBadge(item.status)}
            </div>
          </div>

          {/* Grid 2 colunas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
            <Field label="Telefone" value={item.telefone} />
            <Field label="CNPJ" value={item.cnpj} />
            <Field label="Instagram" value={item.instagram} />
            <Field label="Responsável" value={item.responsavelNome} />
            <Field label="CPF Responsável" value={item.responsavelCpf} />
            
            {/* Site */}
            {item.site && (
              <div>
                <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <Globe className="h-3 w-3" /> Site
                </p>
                <a href={item.site.startsWith('http') ? item.site : `https://${item.site}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline">
                  {item.site}
                </a>
              </div>
            )}

            {/* Específico de Serviços */}
            <Field label="Tipo de Serviço" value={item.tipo?.replace("_", " ")} />
            <Field label="Idiomas" value={item.idiomas} />
            <Field label="Roteiro" value={item.roteiro?.replace(/_/g, " ")} />
          </div>

          {/* Textos longos */}
          <div className="space-y-6">
            <Field label="Endereço" value={item.endereco} />
            <Field label="Especialidade" value={item.especialidade} />
            <Field label="Texto Diferencial" value={item.textoDiferencial} />
            <Field label="Descrição" value={item.descricao} />
            
            {/* Tags */}
            {renderTags(item.tags)}
          </div>

          {/* Comprovante ATUALIZADO */}
          {urlComprovante && (
            <div className="rounded-xl border border-border p-5 bg-muted/10">
              <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <FileText className="h-4 w-4" /> Comprovante
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={`${process.env.NEXT_PUBLIC_API_URL ?? ""}${urlComprovante}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  <FileText className="h-4 w-4 text-primary" />
                  Ver Comprovante
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </a>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}