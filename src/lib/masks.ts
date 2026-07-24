export const onlyDigits = (value: string) => value.replace(/\D/g, "");

const limit = (value: string, maxLength: number) => value.slice(0, maxLength);

export function maskPhone(value: string): string {
  const digits = limit(onlyDigits(value), 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function maskCpf(value: string): string {
  const digits = limit(onlyDigits(value), 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function maskCnpj(value: string): string {
  const digits = limit(onlyDigits(value), 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  }
  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  }
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

export function maskPersonName(value: string): string {
  return value
    .replace(/[0-9]/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/^\s+/, "");
}

export const numericInputProps = {
  inputMode: "numeric" as const,
};

// ─── Validadores ───────────────────────────────────────────────────────────────

/** Valida CPF com algoritmo de dígitos verificadores. */
export function validateCpf(value: string): string | null {
  const digits = onlyDigits(value);
  if (digits.length === 0) return null; // campo opcional
  if (digits.length !== 11) return "CPF deve ter 11 dígitos.";

  // Rejeita sequências iguais (111.111.111-11 etc.)
  if (/^(\d)\1{10}$/.test(digits)) return "CPF inválido.";

  const calc = (factor: number) => {
    let sum = 0;
    for (let i = 0; i < factor - 1; i++) {
      sum += parseInt(digits[i]) * (factor - i);
    }
    const rem = (sum * 10) % 11;
    return rem === 10 || rem === 11 ? 0 : rem;
  };

  if (calc(10) !== parseInt(digits[9])) return "CPF inválido.";
  if (calc(11) !== parseInt(digits[10])) return "CPF inválido.";
  return null;
}

/** Valida CNPJ com algoritmo de dígitos verificadores. */
export function validateCnpj(value: string): string | null {
  const digits = onlyDigits(value);
  if (digits.length === 0) return null;
  if (digits.length !== 14) return "CNPJ deve ter 14 dígitos.";

  if (/^(\d)\1{13}$/.test(digits)) return "CNPJ inválido.";

  const calcDigit = (d: string, weights: number[]) => {
    const sum = weights.reduce((acc, w, i) => acc + parseInt(d[i]) * w, 0);
    const rem = sum % 11;
    return rem < 2 ? 0 : 11 - rem;
  };

  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  if (calcDigit(digits, w1) !== parseInt(digits[12])) return "CNPJ inválido.";
  if (calcDigit(digits, w2) !== parseInt(digits[13])) return "CNPJ inválido.";
  return null;
}

/** Valida telefone: mínimo 10 dígitos (fixo) ou 11 (celular). */
export function validatePhone(value: string): string | null {
  const digits = onlyDigits(value);
  if (digits.length === 0) return null;
  if (digits.length < 10) return "Telefone incompleto. Informe DDD + número.";
  return null;
}

/** Valida handle do Instagram: apenas letras, números, pontos e underscores. */
export function validateInstagram(value: string): string | null {
  if (!value) return null;
  const handle = value.replace(/^@/, "");
  if (handle.length < 1) return null;
  if (!/^[a-zA-Z0-9._]{1,30}$/.test(handle))
    return "Instagram inválido. Use apenas letras, números, pontos e _ (sem espaços).";
  return null;
}

/** Valida URL de site (com ou sem protocolo). */
export function validateSite(value: string): string | null {
  if (!value) return null;
  const url = value.startsWith("http") ? value : `https://${value}`;
  try {
    const u = new URL(url);
    if (!u.hostname.includes(".")) return "URL inválida. Ex: www.seusite.com.br";
    return null;
  } catch {
    return "URL inválida. Ex: www.seusite.com.br";
  }
}
