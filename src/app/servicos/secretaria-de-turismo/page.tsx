"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Play, Image as ImageIcon } from "lucide-react";
import { secretariaTurismoApi } from "@/lib/api/secretaria-turismo";
import type { SecretariaTurismo } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const mediaUrl = (url?: string | null) =>
  url ? (url.startsWith("http") ? url : `${API_URL}${url}`) : null;

export default function SecretariaTurismoPublicPage() {
  const [secretaria, setSecretaria] = useState<SecretariaTurismo | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    secretariaTurismoApi
      .getAll()
      .then((data) => setSecretaria(data[0] ?? null))
      .catch(() => setSecretaria(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground animate-pulse">Carregando…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section
        className="relative overflow-hidden px-4 pb-16 pt-32"
        style={{
          background:
            "linear-gradient(135deg, #7DC242 0%, #F5C900 30%, #F47920 60%, #E91E8C 80%, #009FE3 100%)",
        }}
      >
        <div className="container relative z-10 mx-auto">
          <Link
            href="/servicos"
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm text-white/90 transition-colors hover:bg-white/30"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Serviços
          </Link>
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-white/70">
            Saquarema
          </p>
          <h1 className="font-display text-5xl font-bold uppercase text-white drop-shadow-lg md:text-6xl">
            Secretaria de Turismo
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/90">
            Esporte, Lazer e Turismo — Prefeitura de Saquarema
          </p>
        </div>
      </section>

      <div className="container mx-auto max-w-5xl px-4 py-16 space-y-20">
        {/* Sem conteúdo ainda */}
        {!secretaria && (
          <div className="text-center py-24">
            <p className="text-6xl mb-4">🏖️</p>
            <h2 className="text-xl font-semibold text-foreground mb-2">Em breve</h2>
            <p className="text-muted-foreground text-sm">
              As informações da Secretaria de Turismo serão disponibilizadas em breve.
            </p>
          </div>
        )}

        {secretaria && (
          <>
            {/* —— Institucional —— */}
            <section>
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div>
                  <span
                    className="inline-block px-3 py-1 text-xs font-semibold rounded-full text-white mb-4"
                    style={{ background: "linear-gradient(90deg,#F47920,#E91E8C)" }}
                  >
                    Institucional
                  </span>
                  <p className="text-foreground text-base leading-relaxed whitespace-pre-line">
                    {secretaria.texto}
                  </p>
                </div>

                {secretaria.videoUrl && (
                  <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-video bg-black">
                    <video
                      src={mediaUrl(secretaria.videoUrl) ?? ""}
                      controls
                      className="w-full h-full object-cover"
                      poster=""
                    />
                  </div>
                )}
              </div>
            </section>

            {/* —— Turistando —— */}
            {secretaria.turistando && secretaria.turistando.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div
                    className="h-1 w-8 rounded-full"
                    style={{
                      background: "linear-gradient(90deg,#7DC242,#F5C900)",
                    }}
                  />
                  <h2 className="text-2xl font-bold text-foreground">Turistando</h2>
                </div>

                <div className="space-y-12">
                  {secretaria.turistando.map((t, i) => (
                    <div
                      key={t.id}
                      className={`grid md:grid-cols-2 gap-8 items-start ${
                        i % 2 === 1 ? "md:flex-row-reverse" : ""
                      }`}
                    >
                      {/* texto */}
                      <div className={i % 2 === 1 ? "md:order-2" : ""}>
                        <h3 className="text-xl font-semibold text-foreground mb-3">
                          {t.titulo}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                          {t.texto}
                        </p>
                      </div>

                      {/* imagens */}
                      {t.imagensUrl?.length > 0 && (
                        <div
                          className={`grid grid-cols-2 gap-2 ${
                            i % 2 === 1 ? "md:order-1" : ""
                          }`}
                        >
                          {t.imagensUrl.slice(0, 4).map((u, idx) => (
                            <button
                              key={idx}
                              onClick={() => setLightbox(mediaUrl(u))}
                              className="relative overflow-hidden rounded-xl aspect-square group"
                            >
                              <img
                                src={mediaUrl(u) ?? ""}
                                alt={t.titulo}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <ImageIcon className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* —— Projetos —— */}
            {secretaria.projetos && secretaria.projetos.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div
                    className="h-1 w-8 rounded-full"
                    style={{
                      background: "linear-gradient(90deg,#F47920,#E91E8C)",
                    }}
                  />
                  <h2 className="text-2xl font-bold text-foreground">Projetos & Cursos</h2>
                </div>

                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {secretaria.projetos.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-2xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-md transition-shadow"
                    >
                      {p.imagemUrl ? (
                        <img
                          src={mediaUrl(p.imagemUrl) ?? ""}
                          alt={p.titulo}
                          className="w-full h-40 object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-40 flex items-center justify-center"
                          style={{ background: "linear-gradient(135deg,#7DC242,#009FE3)" }}
                        >
                          <span className="text-white text-4xl">📌</span>
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold text-foreground text-sm mb-1">{p.titulo}</h3>
                        <p className="text-muted-foreground text-xs leading-relaxed line-clamp-3">
                          {p.descricao}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox}
            alt=""
            className="max-w-full max-h-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
