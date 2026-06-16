"use client";

import { useEffect, useState } from "react";
import { fiquePorDentroApi } from "@/lib/api/fique-por-dentro";
import type { FiquePorDentro } from "@/lib/api/fique-por-dentro";
import { safeMediaUrl } from "@/lib/safeMediaUrl";
import Image from "next/image";

// ─── ImageCard ────────────────────────────────────────────────────────────────

function ImageCard({ item }: { item: FiquePorDentro }) {
  const src = safeMediaUrl(item.imagemUrl);
  if (!src) return null;

  return (
    <div className="group relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-muted shadow-sm transition hover:shadow-md">
      <Image
        src={src}
        alt={`Fique por dentro – imagem ${item.ordem}`}
        fill
        className="object-cover transition duration-500 group-hover:scale-105"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="aspect-video w-full animate-pulse rounded-2xl bg-muted"
        />
      ))}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function FiquePorDentroPage() {
  const [items, setItems] = useState<FiquePorDentro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fiquePorDentroApi
      .getAll()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold uppercase tracking-widest">
          Fique Por Dentro
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Confira as novidades e destaques de Arraial do Cabo.
        </p>
      </div>

      {loading ? (
        <Skeleton />
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
          <span className="text-4xl">📷</span>
          <p className="mt-4 text-base font-medium">Nenhuma imagem por enquanto.</p>
          <p className="text-sm">Volte em breve para novidades!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ImageCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </main>
  );
}
