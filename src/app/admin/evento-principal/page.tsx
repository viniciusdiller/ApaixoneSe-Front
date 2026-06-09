"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Save,
} from "lucide-react";
import {
  eventoPrincipalApi,
  type EventoPrincipal,
  type EventoPrincipalCreateDTO,
} from "@/lib/api/eventoPrincipal";

function diasRestantes(dataIso: string): number {
  return Math.max(
    0,
    Math.ceil(
      (new Date(dataIso).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
  );
}

/**
 * Converte "YYYY-MM-DD" (vindo do input[type=date]) para
 * "YYYY-MM-DDT00:00:00.000Z" que o Prisma/backend exige.
 */
function toISODate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00.000Z`).toISOString();
}

const formVazio: EventoPrincipalCreateDTO = {
  titulo: "",
  etapa: "",
  data: "",
};

export default function AdminEventoPrincipalPage() {
  const [evento, setEvento] = useState<EventoPrincipal | null>(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [deletando, setDeletando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [form, setForm] = useState<EventoPrincipalCreateDTO>(formVazio);

  const carregar = () => {
    setLoading(true);
    eventoPrincipalApi
      .getAll()
      .then((lista) => setEvento(lista.length > 0 ? lista[0] : null))
      .catch(() => setErro("Não foi possível carregar o evento."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { carregar(); }, []);

  const abrirCriar = () => {
    setForm(formVazio);
    setModoEdicao(true);
    setErro(null);
    setSucesso(null);
  };

  const abrirEditar = () => {
    if (!evento) return;
    setForm({
      titulo: evento.titulo,
      etapa: evento.etapa ?? "",
      // Garante que o input[type=date] receba exatamente YYYY-MM-DD
      data: evento.data.split("T")[0],
    });
    setModoEdicao(true);
    setErro(null);
    setSucesso(null);
  };

  const cancelar = () => {
    setModoEdicao(false);
    setErro(null);
  };

  const salvar = async () => {
    if (!form.titulo.trim() || !form.data) {
      setErro("Título e data são obrigatórios.");
      return;
    }
    setSalvando(true);
    setErro(null);
    try {
      const payload: EventoPrincipalCreateDTO = {
        titulo: form.titulo.trim(),
        etapa: form.etapa?.trim() || undefined,
        // ✅ Converte YYYY-MM-DD → ISO-8601 completo exigido pelo Prisma
        data: toISODate(form.data),
      };
      if (evento) {
        await eventoPrincipalApi.update(evento.id, payload);
      } else {
        await eventoPrincipalApi.create(payload);
      }
      setSucesso(evento ? "Evento atualizado com sucesso!" : "Evento criado com sucesso!");
      setModoEdicao(false);
      carregar();
    } catch {
      setErro("Erro ao salvar. Verifique os dados e tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  const deletar = async () => {
    if (!evento) return;
    if (!confirm(`Tem certeza que deseja remover "${evento.titulo}"?`)) return;
    setDeletando(true);
    setErro(null);
    try {
      await eventoPrincipalApi.delete(evento.id);
      setSucesso("Evento removido com sucesso.");
      setEvento(null);
    } catch {
      setErro("Erro ao remover o evento.");
    } finally {
      setDeletando(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3">
        <Calendar className="h-7 w-7 text-primary" />
        <div>
          <h1 className="font-display text-2xl font-bold uppercase text-foreground">
            Evento Principal
          </h1>
          <p className="text-sm text-muted-foreground">
            Contagem regressiva exibida na página inicial
          </p>
        </div>
      </div>

      {/* Feedback */}
      {sucesso && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-lg border border-green-400/40 bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-950/20 dark:text-green-400"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {sucesso}
        </motion.div>
      )}
      {erro && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          {erro}
        </motion.div>
      )}

      {/* Carregando */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
        </div>
      )}

      {/* Evento existente */}
      {!loading && evento && !modoEdicao && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold uppercase text-card-foreground">
                {evento.titulo}
              </h2>
              {evento.etapa && (
                <p className="mt-1 text-sm text-muted-foreground">{evento.etapa}</p>
              )}
            </div>
            <div className="shrink-0 rounded-full bg-primary/10 px-4 py-2 text-center">
              <p className="font-display text-3xl font-bold leading-none text-primary">
                {diasRestantes(evento.data)}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">dias</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Data: </span>
            {new Date(evento.data).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              timeZone: "UTC",
            })}
          </p>

          <div className="mt-6 flex gap-3">
            <button
              onClick={abrirEditar}
              className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <Pencil className="h-4 w-4" />
              Editar
            </button>
            <button
              onClick={deletar}
              disabled={deletando}
              className="flex items-center gap-2 rounded-full border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/20 disabled:opacity-50"
            >
              {deletando ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Remover
            </button>
          </div>
        </motion.div>
      )}

      {/* Sem evento */}
      {!loading && !evento && !modoEdicao && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <Calendar className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <p className="font-display text-lg font-semibold text-foreground">
            Nenhum evento cadastrado
          </p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Cadastre o próximo grande evento de Saquarema para exibir a contagem regressiva na home.
          </p>
          <button
            onClick={abrirCriar}
            className="mt-6 flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Cadastrar Evento
          </button>
        </div>
      )}

      {/* Formulário */}
      {modoEdicao && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-6 shadow-sm"
        >
          <h2 className="mb-5 font-display text-lg font-bold uppercase text-foreground">
            {evento ? "Editar Evento" : "Novo Evento"}
          </h2>

          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="titulo">
                Título <span className="text-destructive">*</span>
              </label>
              <input
                id="titulo"
                type="text"
                value={form.titulo}
                onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
                placeholder="ex: Saquarema Pro 2026"
                className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="etapa">
                Etapa <span className="text-muted-foreground">(opcional)</span>
              </label>
              <input
                id="etapa"
                type="text"
                value={form.etapa ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, etapa: e.target.value }))}
                placeholder="ex: WSL Championship Tour"
                className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="data">
                Data do evento <span className="text-destructive">*</span>
              </label>
              <input
                id="data"
                type="date"
                value={form.data}
                onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))}
                className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={salvar}
              disabled={salvando}
              className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {salvando ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {evento ? "Salvar alterações" : "Cadastrar"}
            </button>
            <button
              onClick={cancelar}
              className="flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted"
            >
              <X className="h-4 w-4" />
              Cancelar
            </button>
          </div>
        </motion.div>
      )}

      {!loading && evento && !modoEdicao && (
        <p className="text-center text-xs text-muted-foreground">
          ⚠️ Só pode existir 1 evento principal por vez. Edite ou remova o atual para criar um novo.
        </p>
      )}
    </div>
  );
}
