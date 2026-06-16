import { apiFetch } from "./config";
import type { CatMovel, CreateCatMovelDto, UpdateCatMovelDto } from "./types";

export const catMovelApi = {
  getAll: () => apiFetch<CatMovel[]>("/cat-movel"),
  getById: (id: string) => apiFetch<CatMovel>(`/cat-movel/${id}`),
  create: (data: FormData) =>
    apiFetch<CreateCatMovelDto>("/cat-movel", {
      method: "POST",
      body: data,
    }),
  update: (id: string, data: FormData) =>
    apiFetch<UpdateCatMovelDto>(`/cat-movel/${id}`, { method: "PUT", body: data }),
  remove: (id: string) => apiFetch<void>(`/cat-movel/${id}`, { method: "DELETE" }),
};
