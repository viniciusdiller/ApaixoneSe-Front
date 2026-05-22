import { apiFetch } from "./config";
import type { User } from "./types";

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token?: string;
  token?: string;
}

export const usersApi = {
  register: (data: Omit<User, "id">) =>
    apiFetch<User>("/users/register", { method: "POST", body: JSON.stringify(data) }),

  login: (data: LoginPayload) =>
    apiFetch<LoginResponse>("/users/login", { method: "POST", body: JSON.stringify(data) }),

  getAll: () =>
    apiFetch<User[]>("/users"),

  getById: (id: number) =>
    apiFetch<User>(`/users/${id}`),

  update: (id: number, data: Partial<User>) =>
    apiFetch<User>(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  delete: (id: number) =>
    apiFetch<void>(`/users/${id}`, { method: "DELETE" }),
};
