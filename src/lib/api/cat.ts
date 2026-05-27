import { apiFetch } from "./config";
import type { Cat, CreateCatDto, UpdateCatDto } from "./types";

export const catApi = {
  getAll: () => apiFetch<Cat[]>("/cat"),
  getById: (id: string) => apiFetch<Cat>(`/cat/${id}`),
  create: (data: FormData) =>
    apiFetch<CreateCatDto>("/cat", {
      method: "POST",
      body: data,
    }),
  update: (id: string, data: FormData) =>
    apiFetch<UpdateCatDto>(`/cat/${id}`, { method: "PUT", body: data }),
  remove: (id: string) => apiFetch<void>(`/cat/${id}`, { method: "DELETE" }),
};
