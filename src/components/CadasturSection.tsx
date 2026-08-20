import { ExternalLink, FileText } from "lucide-react";

const CADASTUR_URL = "https://cadastur.turismo.gov.br/";

export function CadasturSection() {
  return (
    <section className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-10 text-center">
      <FileText size={32} className="text-muted-foreground" />
      <h2 className="font-display text-2xl font-bold uppercase text-foreground">
        Cadastur
      </h2>
      <p className="max-w-md text-sm text-muted-foreground">
        Consulte o cadastro oficial de prestadores de serviços turísticos do
        Ministério do Turismo, filtre por saquarema e encontre informações para
        planejar sua viagem.
      </p>
      <a
        href={CADASTUR_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Acessar o Cadastur <ExternalLink size={14} />
      </a>
    </section>
  );
}
