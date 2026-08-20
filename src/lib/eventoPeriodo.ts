/**
 * Formatação de data/período de eventos (sem horário — só dia).
 *
 * Eventos legados foram salvos como data pura ("YYYY-MM-DD"), que o backend
 * grava como meia-noite UTC. Um punhado de registros antigos pode ter um
 * horário real gravado (de quando o formulário chegou a capturar hora); para
 * esses, extrair o dia em UTC poderia mostrar o dia errado, então a exibição
 * do dia usa o fuso de Brasília nesse caso e UTC nos demais.
 */
const TIMEZONE = "America/Sao_Paulo";

function temHorarioReal(iso: string): boolean {
  const d = new Date(iso);
  return d.getUTCHours() !== 0 || d.getUTCMinutes() !== 0 || d.getUTCSeconds() !== 0;
}

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: temHorarioReal(iso) ? TIMEZONE : "UTC",
  });
}

function mesmoDiaCalendario(dataIso: string, dataFimIso: string): boolean {
  const chave = (iso: string) =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone: temHorarioReal(iso) ? TIMEZONE : "UTC",
    }).format(new Date(iso));
  return chave(dataIso) === chave(dataFimIso);
}

/**
 * - Sem dataFim, ou dataFim no mesmo dia → só a data de início.
 * - Com dataFim em dia diferente → intervalo "início – fim".
 */
export function formatarPeriodoEvento(
  data: string,
  dataFim?: string | null,
): string {
  if (!dataFim || mesmoDiaCalendario(data, dataFim)) return formatarData(data);
  return `${formatarData(data)} – ${formatarData(dataFim)}`;
}

/** Versão curta (sem ano) para cards compactos. */
export function formatarPeriodoEventoCurto(
  data: string,
  dataFim?: string | null,
): string {
  const curto = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      timeZone: temHorarioReal(iso) ? TIMEZONE : "UTC",
    });
  if (!dataFim || mesmoDiaCalendario(data, dataFim)) return curto(data);
  return `${curto(data)} – ${curto(dataFim)}`;
}
