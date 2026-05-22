"use client";

import { useEffect, useState } from "react";
import { usersApi } from "@/lib/api";
import type { User } from "@/lib/api";
import { AdminTable } from "@/components/admin/AdminTable";
import { LoadingGrid } from "@/components/ui/LoadingGrid";
import { Trash2 } from "lucide-react";

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    usersApi.getAll().then(setUsers).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (user: User) => {
    if (!confirm(`Excluir usuário "${user.nome}"?`)) return;
    await usersApi.remove(user.id);
    load();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-widest text-foreground">Usuários</h1>
          <p className="text-sm text-muted-foreground">{users.length} registros</p>
        </div>
      </div>

      {loading ? <LoadingGrid count={3} /> : (
        <AdminTable
          data={users}
          columns={[
            { key: "id", label: "ID" },
            { key: "nome", label: "Nome" },
            { key: "email", label: "E-mail" },
            {
              key: "createdAt",
              label: "Criado em",
              render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleDateString("pt-BR") : "—",
            },
          ]}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
