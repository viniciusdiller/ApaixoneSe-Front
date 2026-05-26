"use client";

import { useEffect, useState } from "react";
import { usersApi } from "@/lib/api";
import type { User } from "@/lib/api";
import { UserCircle2, AtSign, Mail, ShieldCheck } from "lucide-react";

type OwnerUser = Pick<User, "id" | "nome" | "usuario" | "email" | "perfil">;

const PERFIL_LABEL: Record<string, string> = {
  ADMIN: "Administrador",
  PARCEIRO: "Parceiro",
  USUARIO: "Usuário",
};

/**
 * Busca e exibe os dados reais do dono de um estabelecimento.
 * Passa `usuarioId` para buscar via API, ou `embedded` se o backend
 * já retornou o objeto usuario populado (usado como seed + fallback).
 */
export function OwnerCard({
  usuarioId,
  embedded,
}: {
  usuarioId: string;
  embedded?: Pick<User, "id" | "nome" | "email" | "perfil"> | null;
}) {
  const [owner, setOwner] = useState<OwnerUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!usuarioId) { setLoading(false); return; }
    setOwner(null);
    setLoading(true);

    const sourceId = embedded?.id ?? usuarioId;
    usersApi
      .getById(sourceId)
      .then((u) => setOwner(u as OwnerUser))
      .catch(() => {
        // fallback: usa o objeto embedded se existir
        if (embedded) setOwner(embedded as OwnerUser);
        else setOwner(null);
      })
      .finally(() => setLoading(false));
  }, [usuarioId, embedded]);

  return (
    <div
      className="rounded-lg p-4"
      style={{
        background:
          "linear-gradient(135deg, hsl(var(--primary) / 0.07) 0%, hsl(var(--primary) / 0.03) 100%)",
        border: "1px solid hsl(var(--primary) / 0.25)",
      }}
    >
      {/* cabeçalho */}
      <div className="mb-3 flex items-center gap-2">
        <UserCircle2 size={15} className="text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Dono da conta</p>
      </div>

      {loading ? (
        <div className="flex animate-pulse items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/20" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-32 rounded bg-primary/20" />
            <div className="h-3 w-48 rounded bg-primary/20" />
          </div>
        </div>
      ) : owner ? (
        <div className="flex items-start gap-3">
          {/* avatar inicial */}
          <div
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: "hsl(var(--primary))" }}
          >
            {owner.nome.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            {/* nome + badge perfil */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-foreground">{owner.nome}</span>
              <span
                className="rounded-full px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor:
                    owner.perfil === "ADMIN"
                      ? "hsl(var(--primary) / 0.15)"
                      : "hsl(var(--primary) / 0.08)",
                  color: "hsl(var(--primary))",
                }}
              >
                {PERFIL_LABEL[owner.perfil] ?? owner.perfil}
              </span>
            </div>

            {/* @usuario */}
            {"usuario" in owner && owner.usuario && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <AtSign size={12} />
                <span>{(owner as OwnerUser).usuario}</span>
              </div>
            )}

            {/* email */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Mail size={12} />
              <span className="break-all">{owner.email}</span>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs italic text-muted-foreground">
          Não foi possível carregar os dados do dono.
        </p>
      )}
    </div>
  );
}
