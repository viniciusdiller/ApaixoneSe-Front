import { apiFetch } from "./config";
import type {
  User,
  RegisterUserDto,
  LoginUserDto,
  LoginResponse,
} from "./types";

export const usersApi = {
  /** POST /users/register */
  register: (dto: RegisterUserDto) =>
    apiFetch<User>("/users/register", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  /** POST /users/login */
  login: (dto: LoginUserDto) =>
    apiFetch<LoginResponse>("/users/login", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  /** GET /users */
  getAll: () => apiFetch<User[]>("/users"),

  /** GET /users/:id */
  getById: (id: number) => apiFetch<User>(`/users/${id}`),

  /** PUT /users/:id */
  update: (id: number, dto: Partial<RegisterUserDto>) =>
    apiFetch<User>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(dto),
    }),

  /** DELETE /users/:id */
  remove: (id: number) =>
    apiFetch<void>(`/users/${id}`, { method: "DELETE" }),
};
