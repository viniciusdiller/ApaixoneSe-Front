import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { ItemPlanoViagem, PlanoViagem } from "@/lib/api/types";

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
    return { label: "Restaurante", nome: item.gastronomia.nome, detalhe: item.gastronomia.endereco };
  if (item.hospedagem)
    return { label: "Hospedagem", nome: item.hospedagem.nome, detalhe: item.hospedagem.endereco };
  if (item.evento)
    return { label: "Evento", nome: item.evento.titulo, detalhe: item.evento.local };
  if (item.atividade)
    return { label: "Atividade", nome: item.atividade.titulo, detalhe: item.atividade.local };
  if (item.servicoTurista)
    return { label: "Servico Turistico", nome: item.servicoTurista.nome, detalhe: item.servicoTurista.tipo.replace(/_/g, " ") };
  return { label: "Item", nome: "Sem detalhes" };
}

function agruparPorData(itens: ItemPlanoViagem[]) {
  const mapa = new Map<string, ItemPlanoViagem[]>();
  [...itens]
    .sort((a, b) => new Date(a.dataHoraAgendada).getTime() - new Date(b.dataHoraAgendada).getTime())
    .forEach((item) => {
      const chave = new Date(item.dataHoraAgendada).toLocaleDateString("pt-BR");
      if (!mapa.has(chave)) mapa.set(chave, []);
      mapa.get(chave)!.push(item);
    });
  return mapa;
}

// ---------------------------------------------------------------------------
// Cores
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

// ---------------------------------------------------------------------------
// Estilos — usa apenas Helvetica (embutida no @react-pdf/renderer, sem CDN)
// ---------------------------------------------------------------------------
const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: C.text,
    backgroundColor: C.white,
    paddingTop: 40,
    paddingBottom: 52,
    paddingHorizontal: 44,
  },
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
  headerTitle: { fontSize: 18, fontFamily: "Helvetica-Bold", color: C.primary, letterSpacing: 1.5 },
  headerSubtitle: { fontSize: 8, color: C.muted, marginTop: 2, letterSpacing: 0.5 },
  headerMeta: { alignItems: "flex-end" },
  headerMetaLabel: { fontSize: 8, color: C.muted, marginBottom: 2 },
  headerMetaValue: { fontSize: 9, fontFamily: "Helvetica-Bold", color: C.text },
  planTitle: { fontSize: 20, fontFamily: "Helvetica-Bold", color: C.text, marginBottom: 4 },
  planPeriod: { fontSize: 10, color: C.muted, marginBottom: 24 },
  dateSection: { marginBottom: 16 },
  dateHeader: {
    backgroundColor: C.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginBottom: 8,
  },
  dateHeaderText: { fontSize: 9, fontFamily: "Helvetica-Bold", color: C.primary, letterSpacing: 0.8 },
  itemCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: C.bg,
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: C.border,
  },
  itemDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: C.primary,
    marginTop: 3, marginRight: 10, flexShrink: 0,
  },
  itemContent: { flex: 1 },
  itemRow: { flexDirection: "row", alignItems: "center", marginBottom: 3 },
  itemLabel: {
    fontSize: 8, fontFamily: "Helvetica-Bold", color: C.primary,
    backgroundColor: C.primaryLight,
    paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, marginRight: 6,
  },
  itemHorario: { fontSize: 8, color: C.muted },
  itemNome: { fontSize: 10, fontFamily: "Helvetica-Bold", color: C.text, marginBottom: 2 },
  itemDetalhe: { fontSize: 8.5, color: C.muted, marginBottom: 3 },
  itemAnotacao: {
    fontSize: 8.5, color: C.amber,
    backgroundColor: C.amberBg,
    padding: 5, borderRadius: 4, marginTop: 3,
  },
  footer: {
    position: "absolute",
    bottom: 24, left: 44, right: 44,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 8,
  },
  footerNote: { fontSize: 7.5, color: C.muted, fontStyle: "italic" },
  footerPage: { fontSize: 7.5, color: C.muted },
  emptyBox: {
    alignItems: "center", paddingVertical: 28,
    borderWidth: 1, borderColor: C.border, borderRadius: 8, marginTop: 8,
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
    day: "2-digit", month: "long", year: "numeric",
  });

  return (
    <Document
      title={`Plano de Viagem - ${plano.titulo}`}
      author="Apaixone-se Saquarema"
      subject="Roteiro de viagem"
    >
      <Page size="A4" style={s.page}>
        {/* Cabecalho */}
        <View style={s.header}>
          <View style={s.headerBrand}>
            <Text style={s.headerTitle}>APAIXONE-SE</Text>
            <Text style={s.headerSubtitle}>SAQUAREMA / RJ - BR</Text>
            <Text style={s.headerSubtitle}>Capital Nacional do Esporte</Text>
          </View>
          <View style={s.headerMeta}>
            <Text style={s.headerMetaLabel}>Gerado em</Text>
            <Text style={s.headerMetaValue}>{geradoEm}</Text>
          </View>
        </View>

        {/* Titulo e periodo */}
        <Text style={s.planTitle}>{plano.titulo}</Text>
        <Text style={s.planPeriod}>
          {formatDate(plano.dataInicio)} {"->"} {formatDate(plano.dataFim)}
        </Text>

        {/* Itens agrupados por data */}
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
                        <Text style={s.itemHorario}>{formatDataHora(item.dataHoraAgendada)}</Text>
                      </View>
                      <Text style={s.itemNome}>{cat.nome}</Text>
                      {cat.detalhe ? <Text style={s.itemDetalhe}>{cat.detalhe}</Text> : null}
                      {item.anotacao ? <Text style={s.itemAnotacao}>Anotacao: {item.anotacao}</Text> : null}
                    </View>
                  </View>
                );
              })}
            </View>
          ))
        )}

        {/* Rodape */}
        <View style={s.footer}>
          <Text style={s.footerNote}>
            Este documento e apenas um planejamento - nenhuma reserva foi efetuada.
          </Text>
          <Text
            style={s.footerPage}
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
