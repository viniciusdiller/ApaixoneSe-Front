/**
 * Constrói um FormData a partir de um objeto de campos.
 *
 * Regras:
 * - Valores File são anexados como binário (multipart).
 * - Valores string/number/boolean são anexados como texto.
 * - Valores null/undefined são ignorados.
 *
 * O mapeamento de nomes de campo do form state para os nomes
 * esperados pelo backend é feito aqui para manter os pages limpos.
 */
export function buildFormData(
  fields: Record<string, string | number | boolean | File | null | undefined>
): FormData {
  const fd = new FormData();

  for (const [key, value] of Object.entries(fields)) {
    if (value === null || value === undefined || value === "") continue;

    if (value instanceof File) {
      fd.append(key, value);
    } else {
      fd.append(key, String(value));
    }
  }

  return fd;
}
