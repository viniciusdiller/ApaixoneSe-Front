import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { ItemPlanoViagem, PlanoViagem } from "@/lib/api/types";

// ---------------------------------------------------------------------------
// Fontes
// ---------------------------------------------------------------------------
Font.register({
  family: "Inter",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff",
      fontWeight: 700,
    },
  ],
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatDataHora(iso: string) {
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function getCategoriaLabel(item: ItemPlanoViagem): {
  label: string;
  nome: string;
  detalhe?: string;
} {
  if (item.gastronomia)
    return {
      label: "Restaurante",
      nome: item.gastronomia.nome,
      detalhe: item.gastronomia.endereco,
    };
  if (item.hospedagem)
    return {
      label: "Hospedagem",
      nome: item.hospedagem.nome,
      detalhe: item.hospedagem.endereco,
    };
  if (item.evento)
    return {
      label: "Evento",
      nome: item.evento.titulo,
      detalhe: item.evento.local,
    };
  if (item.atividade)
    return {
      label: "Atividade",
      nome: item.atividade.titulo,
      detalhe: item.atividade.local,
    };
  if (item.servicoTurista)
    return {
      label: "Serviço Turístico",
      nome: item.servicoTurista.nome,
      detalhe: item.servicoTurista.tipo.replace(/_/g, " "),
    };
  return { label: "Item", nome: "Sem detalhes" };
}

// Agrupa itens por data (dd/mm/yyyy)
function agruparPorData(itens: ItemPlanoViagem[]) {
  const mapa = new Map<string, ItemPlanoViagem[]>();
  [...itens]
    .sort(
      (a, b) =>
        new Date(a.dataHoraAgendada).getTime() -
        new Date(b.dataHoraAgendada).getTime()
    )
    .forEach((item) => {
      const chave = new Date(item.dataHoraAgendada).toLocaleDateString("pt-BR");
      if (!mapa.has(chave)) mapa.set(chave, []);
      mapa.get(chave)!.push(item);
    });
  return mapa;
}

// ---------------------------------------------------------------------------
// Estilos
// ---------------------------------------------------------------------------
const C = {
  primary: "#01696f",
  primaryLight: "#e8f4f5",
  text: "#1a1a1a",
  muted: "#6b7280",
  border: "#e5e7eb",
  bg: "#f9f9f7",
  white: "#ffffff",
  amber: "#92400e",
  amberBg: "#fffbeb",
};

const s = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    fontSize: 10,
    color: C.text,
    backgroundColor: C.white,
    paddingTop: 40,
    paddingBottom: 52,
    paddingHorizontal: 44,
  },
  // Cabeçalho
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: C.primary,
  },
  headerBrand: { flexDirection: "column" },
  headerTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: C.primary,
    letterSpacing: 1.5,
  },
  headerSubtitle: { fontSize: 8, color: C.muted, marginTop: 2, letterSpacing: 0.5 },
  headerMeta: { alignItems: "flex-end" },
  headerMetaLabel: { fontSize: 8, color: C.muted, marginBottom: 2 },
  headerMetaValue: { fontSize: 9, color: C.text, fontWeight: 700 },
  // Título do plano
  planTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: C.text,
    marginBottom: 4,
  },
  planPeriod: {
    fontSize: 10,
    color: C.muted,
    marginBottom: 24,
  },
  // Seção de data
  dateSection: { marginBottom: 16 },
  dateHeader: {
    backgroundColor: C.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginBottom: 8,
  },
  dateHeaderText: {
    fontSize: 9,
    fontWeight: 700,
    color: C.primary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  // Item card
  itemCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: C.bg,
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: C.border,
  },
  itemDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.primary,
    marginTop: 3,
    flexShrink: 0,
  },
  itemContent: { flex: 1 },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 3 },
  itemLabel: {
    fontSize: 8,
    fontWeight: 700,
    color: C.primary,
    backgroundColor: C.primaryLight,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  itemHorario: { fontSize: 8, color: C.muted },
  itemNome: { fontSize: 10, fontWeight: 700, color: C.text, marginBottom: 2 },
  itemDetalhe: { fontSize: 8.5, color: C.muted, marginBottom: 3 },
  itemAnotacao: {
    fontSize: 8.5,
    color: C.amber,
    backgroundColor: C.amberBg,
    padding: 5,
    borderRadius: 4,
    marginTop: 3,
  },
  // Rodapé
  footer: {
    position: "absolute",
    bottom: 24,
    left: 44,
    right: 44,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 8,
  },
  footerNote: { fontSize: 7.5, color: C.muted, fontStyle: "italic" },
  footerPage: { fontSize: 7.5, color: C.muted },
  // Vazio
  emptyBox: {
    alignItems: "center",
    paddingVertical: 28,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    marginTop: 8,
  },
  emptyText: { fontSize: 10, color: C.muted },
});

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------
interface Props {
  plano: PlanoViagem;
  itens: ItemPlanoViagem[];
}

export function PlanoViagemPDF({ plano, itens }: Props) {
  const grupos = agruparPorData(itens);
  const geradoEm = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <Document
      title={`Plano de Viagem — ${plano.titulo}`}
      author="Apaixone-se Saquarema"
      subject="Roteiro de viagem"
    >
      <Page size="A4" style={s.page}>
        {/* ── Cabeçalho ── */}
        <View style={s.header}>
          <View style={s.headerBrand}>
            <Text style={s.headerTitle}>APAIXONE-SE</Text>
            <Text style={s.headerSubtitle}>SAQUAREMA / RJ — BR</Text>
            <Text style={s.headerSubtitle}>Capital Nacional do Esporte</Text>
          </View>
          <View style={s.headerMeta}>
            <Text style={s.headerMetaLabel}>Gerado em</Text>
            <Text style={s.headerMetaValue}>{geradoEm}</Text>
          </View>
        </View>

        {/* ── Título e período ── */}
        <Text style={s.planTitle}>{plano.titulo}</Text>
        <Text style={s.planPeriod}>
          {formatDate(plano.dataInicio)} → {formatDate(plano.dataFim)}
        </Text>

        {/* ── Itens agrupados por data ── */}
        {grupos.size === 0 ? (
          <View style={s.emptyBox}>
            <Text style={s.emptyText}>Nenhum item adicionado a este plano.</Text>
          </View>
        ) : (
          Array.from(grupos.entries()).map(([data, itemsDodia]) => (
            <View key={data} style={s.dateSection}>
              <View style={s.dateHeader}>
                <Text style={s.dateHeaderText}>{data}</Text>
              </View>
              {itemsDodia.map((item) => {
                const cat = getCategoriaLabel(item);
                return (
                  <View key={item.id} style={s.itemCard}>
                    <View style={s.itemDot} />
                    <View style={s.itemContent}>
                      <View style={s.itemRow}>
                        <Text style={s.itemLabel}>{cat.label}</Text>
                        <Text style={s.itemHorario}>
                          {formatDataHora(item.dataHoraAgendada)}
                        </Text>
                      </View>
                      <Text style={s.itemNome}>{cat.nome}</Text>
                      {cat.detalhe ? (
                        <Text style={s.itemDetalhe}>{cat.detalhe}</Text>
                      ) : null}
                      {item.anotacao ? (
                        <Text style={s.itemAnotacao}>📝 {item.anotacao}</Text>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </View>
          ))
        )}

        {/* ── Rodapé ── */}
        <View style={s.footer}>
          <Text style={s.footerNote}>
            Este documento é apenas um planejamento — nenhuma reserva foi efetuada.
          </Text>
          <Text
            style={s.footerPage}
            render={({ pageNumber, totalPages }) =>
              `${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
