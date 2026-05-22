"use client";

import { useEffect, useState } from "react";
import {
  usersApi,
  atividadesApi,
  eventosApi,
  gastronomiaApi,
  hospedagemApi,
  servicoTuristaApi,
  planoViagemApi,
  catApi,
} from "@/lib/api";
import { Users, Calendar, Utensils, BedDouble, Wrench, MapPin, BookOpen, Tag } from "lucide-react";

interface StatCard {
  label: string;
  count: number | string;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ label, count, icon, color }: StatCard) {
  return (
    <div className={`flex items-center gap-4 rounded-lg border border-border bg-card p-5 shadow-sm`}>
      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{count}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    users: "...",
    atividades: "...",
    eventos: "...",
    gastronomia: "...",
    hospedagem: "...",
    servicos: "...",
    planos: "...",
    cats: "...",
  });

  useEffect(() => {
    Promise.allSettled([
      usersApi.getAll(),
      atividadesApi.getAll(),
      eventosApi.getAll(),
      gastronomiaApi.getAll(),
      hospedagemApi.getAll(),
      servicoTuristaApi.getAll(),
      planoViagemApi.getAll(),
      catApi.getAll(),
    ]).then(([u, a, e, g, h, s, p, c]) => {
      setStats({
        users: u.status === "fulfilled" ? u.value.length : "—",
        atividades: a.status === "fulfilled" ? a.value.length : "—",
        eventos: e.status === "fulfilled" ? e.value.length : "—",
        gastronomia: g.status === "fulfilled" ? g.value.length : "—",
        hospedagem: h.status === "fulfilled" ? h.value.length : "—",
        servicos: s.status === "fulfilled" ? s.value.length : "—",
        planos: p.status === "fulfilled" ? p.value.length : "—",
        cats: c.status === "fulfilled" ? c.value.length : "—",
      });
    });
  }, []);

  return (
    <div>
      <h1 className="font-display mb-2 text-3xl font-bold uppercase tracking-widest text-foreground">
        Painel Admin
      </h1>
      <p className="mb-8 text-muted-foreground">Visão geral dos dados cadastrados no sistema.</p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Usuários" count={stats.users} icon={<Users className="h-5 w-5 text-white" />} color="bg-primary" />
        <StatCard label="Atividades" count={stats.atividades} icon={<MapPin className="h-5 w-5 text-white" />} color="bg-restinga" />
        <StatCard label="Eventos" count={stats.eventos} icon={<Calendar className="h-5 w-5 text-white" />} color="bg-accent" />
        <StatCard label="Gastronomia" count={stats.gastronomia} icon={<Utensils className="h-5 w-5 text-white" />} color="bg-secondary" />
        <StatCard label="Hospedagem" count={stats.hospedagem} icon={<BedDouble className="h-5 w-5 text-white" />} color="bg-primary" />
        <StatCard label="Serviços" count={stats.servicos} icon={<Wrench className="h-5 w-5 text-white" />} color="bg-restinga" />
        <StatCard label="Planos de Viagem" count={stats.planos} icon={<BookOpen className="h-5 w-5 text-white" />} color="bg-secondary" />
        <StatCard label="Categorias" count={stats.cats} icon={<Tag className="h-5 w-5 text-white" />} color="bg-accent" />
      </div>
    </div>
  );
}
