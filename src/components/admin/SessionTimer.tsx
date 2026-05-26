"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ShieldAlert, ShieldOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getToken } from "@/lib/api/auth";

// ── Decodifica o payload do JWT sem biblioteca externa ──────────────────────
function getTokenExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

// ── Formata os segundos restantes em HH:MM:SS ───────────────────────────────
function formatTime(seconds: number): string {
  if (seconds <= 0) return "00:00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [
    String(h).padStart(2, "0"),
    String(m).padStart(2, "0"),
    String(s).padStart(2, "0"),
  ].join(":");
}

export function SessionTimer() {
  const { logout } = useAuth();
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  const calcRemaining = useCallback((): number | null => {
    const token = getToken();
    if (!token) return null;
    const expiry = getTokenExpiry(token);
    if (!expiry) return null;
    return Math.max(0, Math.floor((expiry - Date.now()) / 1000));
  }, []);

  useEffect(() => {
    // inicia imediatamente
    setSecondsLeft(calcRemaining());

    const interval = setInterval(() => {
      const rem = calcRemaining();
      setSecondsLeft(rem);

      // quando chegar a zero, faz logout automático
      if (rem !== null && rem <= 0) {
        clearInterval(interval);
        logout();
        router.push("/login");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [calcRemaining, logout, router]);

  if (secondsLeft === null) return null;

  // ── estados visuais ─────────────────────────────────────────────────────
  const isExpired = secondsLeft <= 0;
  const isWarning = secondsLeft > 0 && secondsLeft <= 30 * 60; // < 30 min
  const isCritical = secondsLeft > 0 && secondsLeft <= 5 * 60;  // < 5 min

  const colors = isExpired
    ? { ring: "border-destructive/40", bg: "bg-destructive/8", text: "text-destructive", label: "text-destructive/70", icon: <ShieldOff className="h-3.5 w-3.5" /> }
    : isCritical
    ? { ring: "border-destructive/40", bg: "bg-destructive/8", text: "text-destructive", label: "text-destructive/70", icon: <ShieldAlert className="h-3.5 w-3.5 animate-pulse" /> }
    : isWarning
    ? { ring: "border-amber-400/40", bg: "bg-amber-400/8", text: "text-amber-600 dark:text-amber-400", label: "text-amber-600/70 dark:text-amber-400/70", icon: <ShieldAlert className="h-3.5 w-3.5" /> }
    : { ring: "border-border", bg: "bg-muted/60", text: "text-foreground", label: "text-muted-foreground", icon: <ShieldCheck className="h-3.5 w-3.5 text-primary" /> };

  return (
    <div
      className={`mx-3 mb-3 rounded-lg border px-3 py-2.5 ${
        colors.ring
      } ${colors.bg} transition-colors duration-500`}
    >
      {/* cabeçalho */}
      <div className={`mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest ${colors.label}`}>
        {colors.icon}
        Sessão admin
      </div>

      {/* cronômetro */}
      <p
        className={`font-mono text-lg font-bold tabular-nums leading-none ${
          colors.text
        } ${isCritical ? "animate-pulse" : ""}`}
      >
        {formatTime(secondsLeft)}
      </p>

      {/* barra de progresso */}
      <ProgressBar secondsLeft={secondsLeft} total={24 * 3600} isCritical={isCritical} isWarning={isWarning} />

      {/* mensagem contextual */}
      {isCritical && !isExpired && (
        <p className="mt-1.5 text-[10px] text-destructive/80">
          Sessão expirando em breve!
        </p>
      )}
      {isExpired && (
        <p className="mt-1.5 text-[10px] text-destructive/80">
          Sessão encerrada. Redirecionando…
        </p>
      )}
    </div>
  );
}

// ── Barra de progresso animada ───────────────────────────────────────────────
function ProgressBar({
  secondsLeft,
  total,
  isCritical,
  isWarning,
}: {
  secondsLeft: number;
  total: number;
  isCritical: boolean;
  isWarning: boolean;
}) {
  const pct = Math.max(0, Math.min(100, (secondsLeft / total) * 100));
  const barColor = isCritical
    ? "bg-destructive"
    : isWarning
    ? "bg-amber-400"
    : "bg-primary";

  return (
    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-border">
      <div
        className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
