import { apiFetch } from "./config";
import type { LocalCultural } from "./types";

export const culturaApi = {
  getAll: () => apiFetch<LocalCultural[]>("/cultura"),
  getById: (id: string) => apiFetch<LocalCultural>(`/cultura/${id}`),
  create: (data: FormData) =>
    apiFetch<LocalCultural>("/cultura", { method: "POST", body: data }),
  update: (id: string, data: FormData) =>
    apiFetch<LocalCultural>(`/cultura/${id}`, { method: "PUT", body: data }),
  remove: (id: string) =>
    apiFetch<void>(`/cultura/${id}`, { method: "DELETE" }),
};
