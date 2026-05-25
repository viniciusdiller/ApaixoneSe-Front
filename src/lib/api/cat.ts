import { apiFetch } from "./config";
import type { Cat, CreateCatDto, UpdateCatDto } from "./types";

export const catApi = {
  getAll: () => apiFetch<Cat[]>("/cat"),
  getById: (id: string) => apiFetch<Cat>(`/cat/${id}`),
  create: (data: CreateCatDto) =>
    apiFetch<Cat>("/cat", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: UpdateCatDto) =>
    apiFetch<Cat>(`/cat/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id: string) => apiFetch<void>(`/cat/${id}`, { method: "DELETE" }),
};
