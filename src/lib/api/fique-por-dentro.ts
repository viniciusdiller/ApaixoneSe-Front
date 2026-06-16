import { apiRequest } from "./config";

export interface FiquePorDentro {
  id: string;
  ordem: string; // "1" | "2" | "3" | "4" | "5"
  imagemUrl: string;
  createdAt: string;
  updatedAt: string;
}

export const fiquePorDentroApi = {
  /** GET /fique-por-dentro — público */
  getAll(): Promise<FiquePorDentro[]> {
    return apiRequest<FiquePorDentro[]>("/fique-por-dentro");
  },

  /** POST /fique-por-dentro — ADMIN, multipart/form-data com campos `ordem` e `imagem` */
  create(formData: FormData): Promise<FiquePorDentro> {
    return apiRequest<FiquePorDentro>("/fique-por-dentro", {
      method: "POST",
      body: formData,
    });
  },

  /** DELETE /fique-por-dentro/:id — ADMIN */
  remove(id: string): Promise<void> {
    return apiRequest<void>(`/fique-por-dentro/${id}`, { method: "DELETE" });
  },
};
