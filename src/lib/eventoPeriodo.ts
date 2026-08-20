/**
 * Formatação de data/período de eventos.
 *
 * Eventos legados foram salvos como data pura ("YYYY-MM-DD", sem horário real),
 * o que o backend grava como meia-noite UTC. Eventos criados com o seletor de
 * data/hora carregam um horário real, escolhido no fuso de Saquarema-RJ.
 * Por isso a exibição do DIA usa UTC quando não há horário (evita o típico bug
 * de "um dia a menos" em fusos negativos) e o fuso de Brasília quando há.
 */
const TIMEZONE = "America/Sao_Paulo";

export function temHorarioReal(iso: string): boolean {
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

function formatarHora(iso: string): string {
  const partes = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: TIMEZONE,
  }).formatToParts(new Date(iso));
  const hora = partes.find((p) => p.type === "hour")?.value ?? "00";
  const minuto = partes.find((p) => p.type === "minute")?.value ?? "00";
  return minuto === "00" ? `${hora}h` : `${hora}h${minuto}`;
}

function mesmoDiaCalendario(dataIso: string, dataFimIso: string): boolean {
  const chave = (iso: string) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE }).format(new Date(iso));
  return chave(dataIso) === chave(dataFimIso);
}

/**
 * - Sem dataFim → só a data de início (dia único).
 * - Com dataFim em dia diferente → intervalo "início – fim".
 * - Com dataFim no mesmo dia → data + faixa de horário "HHh às HHh".
 */
export function formatarPeriodoEvento(
  data: string,
  dataFim?: string | null,
): string {
  if (!dataFim) return formatarData(data);
  if (mesmoDiaCalendario(data, dataFim)) {
    return `${formatarData(data)}, ${formatarHora(data)} às ${formatarHora(dataFim)}`;
  }
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
  if (!dataFim) return curto(data);
  if (mesmoDiaCalendario(data, dataFim)) {
    return `${curto(data)}, ${formatarHora(data)} às ${formatarHora(dataFim)}`;
  }
  return `${curto(data)} – ${curto(dataFim)}`;
}
