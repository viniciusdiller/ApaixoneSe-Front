import { api } from "./api";
import type { FiquePorDentro } from "./types";

export const fiquePorDentroApi = {
  getAll: (): Promise<FiquePorDentro[]> =>
    api.get("/fique-por-dentro"),

  create: (formData: FormData): Promise<FiquePorDentro> =>
    api.postForm("/fique-por-dentro", formData),

  /** Substitui apenas a imagem de um item (sem trocar ordem) */
  update: (id: string, formData: FormData): Promise<FiquePorDentro> =>
    api.putForm(`/fique-por-dentro/${id}`, formData),

  /** Troca as ordens de dois itens atomicamente */
  swap: (idA: string, idB: string): Promise<{ message: string }> =>
    api.put("/fique-por-dentro/swap", { idA, idB }),

  remove: (id: string): Promise<void> =>
    api.delete(`/fique-por-dentro/${id}`),
};
