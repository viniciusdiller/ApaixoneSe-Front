import { apiFetch } from "./config";
import type { User, RegisterUserDto, LoginResponse } from "./types";

export interface LoginPayload {
  identificador: string;
  senha: string;
}

export const usersApi = {
  register: (data: RegisterUserDto) =>
    apiFetch<User>("/users/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: LoginPayload) =>
    apiFetch<LoginResponse>("/users/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getAll: () => apiFetch<User[]>("/users"),
  getById: (id: string) => apiFetch<User>(`/users/${id}`),
  update: (id: string, data: Partial<RegisterUserDto>) =>
    apiFetch<User>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) => apiFetch<void>(`/users/${id}`, { method: "DELETE" }),

  setActive: (id: string, active: boolean) =>
    apiFetch<User>(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ active }),
    }),
};
