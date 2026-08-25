"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, AlertCircle, MapPin, Phone, Instagram, X, Route, Globe, Filter, Star, Tag } from "lucide-react";
import { servicoTuristaApi } from "@/lib/api";
import type { ServicoTurista, TipoServicoTurista } from "@/lib/api";
import { safeMediaUrl } from "@/lib/safeMediaUrl";
import { ROTEIROS } from "@/lib/roteiros";
import { MODALIDADES_ESPORTE, MODALIDADE_LABELS } from "@/lib/api/servico-turista";
import { trackClick } from "@/lib/trackClick";

// Mapeia o tipo de servico para a categoria usada no contador de cliques
// (mesmo valor do slug da rota em /servicos/*)
const TIPO_PARA_CATEGORIA_CLICK: Record<TipoServicoTurista, string> = {
  GUIA_TURISMO: "guias",
  AGENCIA_TURISMO: "agencias",
  ESPORTE_LAZER: "esportes",
  LOCADORA_VEICULOS: "locadoras",
};

// Tipos que exigem comprovante Cadastur (mesmos exigidos no cadastro admin)
const EXIGE_CADASTUR: TipoServicoTurista[] = [
  "GUIA_TURISMO",
  "AGENCIA_TURISMO",
  "LOCADORA_VEICULOS",
];

// Apenas Guia e Agência podem ser vinculados a roteiros
const PODE_TER_ROTEIRO: TipoServicoTurista[] = [
  "GUIA_TURISMO",
  "AGENCIA_TURISMO",
];

interface Props {
  tipo: TipoServicoTurista;
  titulo: string;
  subtitulo: string;
  descricao: string;
  emoji: string;
  labelSingular: string;
  labelPlural: string;
  imagemFallback: string;
  heroImage?: string;
}

function buildSiteHref(site?: string | null): string | null {
  if (!site) return null;
  return site.startsWith("http") ? site : `https://${site}`;
}

export function ServicoTuristaListPage({
  tipo,
  titulo,
  subtitulo,
  descricao,
  emoji,
  labelSingular,
  labelPlural,
  imagemFallback,
  heroImage,
}: Props) {
  const [servicos, setServicos] = useState<ServicoTurista[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);
  const [selecionado, setSelecionado] = useState<ServicoTurista | null>(null);
  const [roteiroAtivo, setRoteiroAtivo] = useState<string | null>(null);
  const [modalidadesAtivas, setModalidadesAtivas] = useState<string[]>([]);

  useEffect(() => {
    servicoTuristaApi
      .getAll()
      .then((data) =>
        setServicos(
          data.filter((s) => s.status === "APROVADO" && s.tipo === tipo)
        )
      )
      .catch(() => setErro(true))
      .finally(() => setLoading(false));
  }, [tipo]);

  useEffect(() => {
    document.body.style.overflow = selecionado ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [selecionado]);

  const imgUrl = (s: ServicoTurista) =>
    safeMediaUrl(s.logoUrl ?? s.fotoUrl) || imagemFallback;

  const podeTerRoteiro = PODE_TER_ROTEIRO.includes(tipo);
  const ehEsporteLazer = tipo === "ESPORTE_LAZER";

  const getRoteirosMeta = (s: ServicoTurista) =>
    podeTerRoteiro && Array.isArray(s.roteiros)
      ? s.roteiros
          .map((r) => ROTEIROS.find((rt) => rt.enum === r))
          .filter((r): r is (typeof ROTEIROS)[number] => Boolean(r))
      : [];

  const getModalidadesLabels = (s: ServicoTurista) =>
    ehEsporteLazer && Array.isArray(s.modalidades)
      ? s.modalidades.map(
          (m) => MODALIDADE_LABELS[m as keyof typeof MODALIDADE_LABELS] ?? m,
        )
      : [];

  const exigeCadastur = EXIGE_CADASTUR.includes(tipo);

  // Coleta apenas os roteiros presentes nesta lista de serviços
  const roteirosDisponiveis = useMemo(() => {
    if (!podeTerRoteiro) return [];
    const enums = new Set(servicos.flatMap((s) => s.roteiros ?? []));
    return ROTEIROS.filter((r) => enums.has(r.enum));
  }, [servicos, podeTerRoteiro]);

  // Coleta apenas as modalidades presentes nesta lista (só Esporte/Lazer)
  const modalidadesDisponiveis = useMemo(() => {
    if (!ehEsporteLazer) return [];
    const presentes = new Set(servicos.flatMap((s) => s.modalidades ?? []));
    return MODALIDADES_ESPORTE.filter((m) => presentes.has(m));
  }, [servicos, ehEsporteLazer]);

  const toggleModalidadeAtiva = (modalidade: string) => {
    setModalidadesAtivas((prev) =>
      prev.includes(modalidade)
        ? prev.filter((m) => m !== modalidade)
        : [...prev, modalidade],
    );
  };

  // Filtra serviços pelo roteiro/modalidade ativo, conforme o tipo da página.
  // Modalidade é multi-seleção: o serviço aparece se tiver AO MENOS UMA das selecionadas.
  const servicosFiltrados = useMemo(() => {
    if (podeTerRoteiro && roteiroAtivo) {
      return servicos.filter((s) =>
        (s.roteiros ?? []).some((r) => r === roteiroAtivo),
      );
    }
    if (ehEsporteLazer && modalidadesAtivas.length > 0) {
      return servicos.filter((s) =>
        (s.modalidades ?? []).some((m) => modalidadesAtivas.includes(m)),
      );
    }
    return servicos;
  }, [servicos, roteiroAtivo, modalidadesAtivas, podeTerRoteiro, ehEsporteLazer]);

  const filtroAtivo = podeTerRoteiro
    ? roteiroAtivo
    : ehEsporteLazer
      ? modalidadesAtivas.length > 0
      : false;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section
        className="relative overflow-hidden bg-cover bg-center px-4 pb-16 pt-32"
        style={{ backgroundImage: `url('${heroImage}')` }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <span
          aria-hidden
          className="absolute right-8 top-1/2 -translate-y-1/2 select-none text-[160px] opacity-10"
        >
          {emoji}
        </span>
        <div className="container relative z-10 mx-auto">
          <Link
            href="/servicos"
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2 text-sm text-primary-foreground/80 transition-colors hover:bg-primary-foreground/20 hover:text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Serviços
          </Link>
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-primary-foreground/60">
            {subtitulo}
          </p>
          <h1 className="font-display text-5xl font-bold uppercase text-primary-foreground drop-shadow-lg md:text-6xl">
            {titulo}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-primary-foreground/80">
            {descricao}
          </p>
        </div>
      </section>

      {/* Lista */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="font-display text-4xl font-bold uppercase text-foreground">
          {titulo}
        </h2>

        {/* Filtro por Roteiro (Guia/Agência) ou Modalidade (Esporte/Lazer) */}
        {!loading && !erro && podeTerRoteiro && roteirosDisponiveis.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <Filter className="h-4 w-4" />
              Filtrar por roteiro:
            </span>
            <button
              onClick={() => setRoteiroAtivo(null)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                roteiroAtivo === null
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary"
              }`}
            >
              Todos
            </button>
            {roteirosDisponiveis.map((roteiro) => (
              <button
                key={roteiro.enum}
                onClick={() =>
                  setRoteiroAtivo(
                    roteiroAtivo === roteiro.enum ? null : roteiro.enum
                  )
                }
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  roteiroAtivo === roteiro.enum
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-accent/20 text-accent-foreground border-accent/30 hover:bg-accent/40"
                }`}
              >
                <Route className="h-3 w-3" />
                {roteiro.label}
              </button>
            ))}
          </div>
        )}

        {!loading && !erro && ehEsporteLazer && modalidadesDisponiveis.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <Filter className="h-4 w-4" />
              Filtrar por modalidade:
            </span>
            <button
              onClick={() => setModalidadesAtivas([])}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                modalidadesAtivas.length === 0
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary"
              }`}
            >
              Todas
            </button>
            {modalidadesDisponiveis.map((modalidade) => (
              <button
                key={modalidade}
                onClick={() => toggleModalidadeAtiva(modalidade)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  modalidadesAtivas.includes(modalidade)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-accent/20 text-accent-foreground border-accent/30 hover:bg-accent/40"
                }`}
              >
                <Tag className="h-3 w-3" />
                {MODALIDADE_LABELS[modalidade]}
              </button>
            ))}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {loading ? (
            <p className="col-span-full text-center text-muted-foreground">
              Carregando {labelPlural}...
            </p>
          ) : erro ? (
            <div className="col-span-full rounded-xl border border-border bg-card p-8 text-center shadow-sm">
              <AlertCircle className="mx-auto mb-4 h-10 w-10 text-destructive/60" />
              <p className="font-display text-2xl font-bold text-foreground">
                Ops! Tivemos um imprevisto.
              </p>
              <p className="mt-2 text-muted-foreground">
                Não conseguimos carregar os dados. Tente novamente mais tarde.
              </p>
            </div>
          ) : servicosFiltrados.length === 0 ? (
            <div className="col-span-full py-10 text-center">
              <span className="mb-3 block text-5xl">{emoji}</span>
              <p className="font-display text-2xl text-foreground">
                {filtroAtivo
                  ? `Nenhum ${labelSingular} encontrado para ${podeTerRoteiro ? "este roteiro" : "esta modalidade"}.`
                  : `Nenhum ${labelSingular} disponível no momento.`}
              </p>
              <p className="mt-2 text-muted-foreground">
                {filtroAtivo
                  ? `Tente selecionar ${podeTerRoteiro ? "outro roteiro" : "outra modalidade"} ou veja todos.`
                  : "Em breve novos parceiros serão adicionados."}
              </p>
            </div>
          ) : (
            servicosFiltrados.map((servico, i) => {
              const siteHref = buildSiteHref(servico.site);
              return (
                <motion.article
                  key={servico.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
                >
                  <div
                    className="relative h-52 shrink-0 bg-contain bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${imgUrl(servico)})` }}
                  >
                    {exigeCadastur && (
                      <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground shadow">
                        <Star className="h-3 w-3 fill-current" />
                        Cadastur
                      </div>
                    )}
                  </div>
                  <div className="flex grow flex-col p-5">
                    <h3 className="font-display text-2xl font-bold uppercase">
                      {servico.nome}
                    </h3>
                    <p className="mt-2 grow text-sm text-muted-foreground line-clamp-2">
                      {servico.descricao ||
                        servico.endereco ||
                        `Telefone: ${servico.telefone}`}
                    </p>

                    {/* Roteiros vinculados (Guia/Agência) */}
                    {getRoteirosMeta(servico).length > 0 && (
                      <div className="mt-3 flex items-start gap-1.5">
                        <Route className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        <span className="text-xs text-muted-foreground">
                          Roteiros:{" "}
                          <span className="font-semibold text-foreground">
                            {getRoteirosMeta(servico)
                              .map((r) => r.label)
                              .join(", ")}
                          </span>
                        </span>
                      </div>
                    )}

                    {/* Modalidades (Esporte/Lazer) */}
                    {getModalidadesLabels(servico).length > 0 && (
                      <div className="mt-3 flex items-start gap-1.5">
                        <Tag className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        <span className="text-xs text-muted-foreground">
                          Modalidades:{" "}
                          <span className="font-semibold text-foreground">
                            {getModalidadesLabels(servico).join(", ")}
                          </span>
                        </span>
                      </div>
                    )}

                    {/* Site no card */}
                    {siteHref && (
                      <div className="mt-3 flex items-center gap-2">
                        <Globe className="h-4 w-4 shrink-0 text-primary" />
                        <a
                          href={siteHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline truncate"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {servico.site!.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                        </a>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        trackClick(TIPO_PARA_CATEGORIA_CLICK[tipo], servico.id);
                        setSelecionado(servico);
                      }}
                      className="mt-4 w-fit rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
                    >
                      Ver detalhes
                    </button>
                  </div>
                </motion.article>
              );
            })
          )}
        </div>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {selecionado && (() => {
          const siteHref = buildSiteHref(selecionado.site);
          return (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
              onClick={() => setSelecionado(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
              >
                <button
                  onClick={() => setSelecionado(null)}
                  className="absolute right-4 top-4 z-10 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="overflow-y-auto">
                  <div
                    className="h-48 w-full bg-contain bg-center bg-no-repeat bg-muted sm:h-64"
                    style={{ backgroundImage: `url(${imgUrl(selecionado)})` }}
                  />

                  <div className="p-6 sm:p-8">
                    <h3 className="mb-1 font-display text-3xl font-bold uppercase text-foreground sm:text-4xl">
                      {selecionado.nome}
                    </h3>

                    {/* Badges: roteiros / modalidades + idiomas */}
                    <div className="mb-4 flex flex-wrap gap-2">
                      {getRoteirosMeta(selecionado).map((r) => (
                        <Link
                          key={r.enum}
                          href={`/roteiros/${r.slug}`}
                          className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent-foreground transition-colors hover:bg-accent/40"
                        >
                          <Route className="h-3 w-3" />
                          Roteiro {r.label}
                        </Link>
                      ))}
                      {getModalidadesLabels(selecionado).map((label) => (
                        <span
                          key={label}
                          className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent-foreground"
                        >
                          <Tag className="h-3 w-3" />
                          {label}
                        </span>
                      ))}
                      {selecionado.idiomas && (
                        <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                          Idiomas: {selecionado.idiomas}
                        </span>
                      )}
                    </div>

                    {selecionado.descricao && (
                      <p className="mb-4 text-sm text-muted-foreground">
                        {selecionado.descricao}
                      </p>
                    )}

                    <div className="mt-4 space-y-4 text-muted-foreground">
                      {selecionado.endereco && (
                        <div className="flex items-start gap-3">
                          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                          <p>{selecionado.endereco}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 shrink-0 text-primary" />
                        <p>{selecionado.telefone || "Telefone não informado"}</p>
                      </div>

                      {selecionado.instagram && (
                        <div className="flex items-center gap-3">
                          <Instagram className="h-5 w-5 shrink-0 text-primary" />
                          <a
                            href={`https://instagram.com/${
                              selecionado.instagram.replace("@", "")
                            }`}
                            target="_blank"
                            rel="noreferrer"
                            className="transition-colors hover:text-primary hover:underline"
                          >
                            {selecionado.instagram}
                          </a>
                        </div>
                      )}

                      {siteHref && (
                        <div className="flex items-center gap-3">
                          <Globe className="h-5 w-5 shrink-0 text-primary" />
                          <a
                            href={siteHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-colors hover:text-primary hover:underline truncate"
                          >
                            {selecionado.site!.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
