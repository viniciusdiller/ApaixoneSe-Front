"use client";

import { useEffect, useState } from "react";
import { formatDisplayText } from "@/lib/textDisplay";
import { motion, AnimatePresence } from "framer-motion";
import { culturaApi } from "@/lib/api";
import type { LocalCultural } from "@/lib/api";
import { safeMediaUrl } from "@/lib/safeMediaUrl";
import { X, ArrowLeft, AlertCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import CarroselArtesanato from "@/components/CarroselArtesanato";

export default function HistoriaPage() {
  const [locais, setLocais] = useState<LocalCultural[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);
  const [clickedCard, setClickedCard] = useState<string | null>(null);
  const [localSelecionado, setLocalSelecionado] =
    useState<LocalCultural | null>(null);

  useEffect(() => {
    culturaApi
      .getAll()
      .then(setLocais)
      .catch(() => setErro(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <section
        className="relative bg-cover bg-center px-4 pb-12 pt-32"
        style={{ backgroundImage: "url('/images/header/historia.jpeg')" }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={clickedCard ? { opacity: 0, y: -20 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="container relative z-10 mx-auto"
        >
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/20 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para página inicial
          </Link>
          <h1 className="font-display text-5xl font-bold uppercase text-white md:text-6xl">
            Historia
          </h1>
          <p className="mt-4 max-w-xl text-white/80">
            Conheça um pouco mais da tradição saquaremense.

          </p>
        </motion.div>
      </section>

      <section className="bg-muted px-4 py-14">
        <div className="container mx-auto grid grid-cols-1 gap-6 md:grid-cols-2">
          <article className="flex flex-col items-center justify-center text-center p-0 md:min-h-[420px] md:rounded-xl md:border md:border-border md:bg-card md:p-6">
            <h2 className="font-display text-3xl uppercase text-primary">
              História de Saquarema
            </h2>
            <p className="mt-5 text-muted-foreground">
              A história de Saquarema é escrita pelo constante encontro entre a
              terra e o oceano. Das raízes milenares preservadas nos sambaquis e
              a rica herança das pacatas vilas de pescadores, a cidade evoluiu
              até ser eternizada mundialmente como a Capital Nacional do
              Esporte. Aqui, o patrimônio histórico abraça a religiosidade,
              simbolizada pelo Círio mais antigo do Brasil e pela clássica
              Igreja de Nossa Senhora de Nazareth. Seja pelas ondas perfeitas de
              Itaúna, pelo legado musical do Templo do Rock ou pela energia de
              sua natureza, Saquarema oferece uma verdadeira viagem no tempo em
              total sintonia com o mar.
            </p>
          </article>
          <article className="flex flex-col items-center justify-center text-center p-0 md:min-h-[420px] md:rounded-2xl md:border md:border-border md:bg-card md:p-8 md:shadow-sm">
            <h2 className="font-display text-3xl uppercase text-primary">
              Destaques Visuais
            </h2>
            <div className="mt-4 grid w-full grid-cols-2 gap-3 md:grid-cols-3">
              {[
                "/images/destaques-visuais/Esquadrilha-Fumaça.jpg",
                "/images/destaques-visuais/WSL.jpg",
                "/images/destaques-visuais/Miguel-Pupo.jpg",
                "/images/destaques-visuais/Fusca.jpg",
                "/images/hero-saquarema.jpeg",
                "/images/destaques-visuais/Meca-Igreja.jpg",
              ].map((imagem) => (
                <div
                  key={imagem}
                  className="h-28 md:h-48 rounded-md bg-cover bg-center"
                  style={{ backgroundImage: `url(${imagem})` }}
                />
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <h2 className="font-display text-4xl font-bold uppercase text-foreground">
          Lugares Culturais

        </h2>

        {loading ? (
          <p className="mt-8 text-center text-muted-foreground">
            Carregando lugares culturais...

          </p>
        ) : erro ? (
          <div className="mt-8 rounded-xl border border-border bg-card p-8 text-center shadow-sm">
            <AlertCircle className="mx-auto mb-4 h-10 w-10 text-destructive/60" />
            <p className="font-display text-2xl font-bold text-foreground">
              Ops! Tivemos um imprevisto.
            </p>
            <p className="mt-2 text-muted-foreground">
              Não conseguimos carregar os dados. Tente novamente mais tarde.
            </p>
          </div>
        ) : locais.length === 0 ? (
          <p className="mt-8 text-center text-muted-foreground">
            Nenhum local cultural cadastrado ainda.

          </p>
        ) : (
          <div className="mt-8 grid auto-rows-[210px] grid-cols-1 gap-5 md:auto-rows-[230px] md:grid-cols-3">
            {locais.map((local, i) => (
              <motion.div
                key={local.id}
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="h-full"
              >
                <article
                  onClick={() => setLocalSelecionado(local)}
                  className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-primary/50 hover:shadow-xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <h3 className="relative z-10 font-display text-2xl uppercase transition-colors group-hover:text-primary">
                    {local.nome}
                  </h3>
                  <p className="relative z-10 mt-2 min-h-0 flex-1 overflow-hidden text-sm leading-5 text-muted-foreground line-clamp-6">
                    {local.descricao}
                  </p>
                  <p className="relative z-10 mt-2 shrink-0 text-sm font-semibold text-primary transition-colors group-hover:text-primary/80">
                    Ler mais &rarr;
                  </p>
                </article>
              </motion.div>
            ))}
          </div>
        )}
      </section>
      
      <section className=" px-4 py-14">
        <div className="container mx-auto grid grid-cols-1 gap-6 md:grid-cols-2">
          <article className="flex flex-col items-center justify-center text-center p-0 md:min-h-[420px] md:rounded-xl md:border md:border-border md:bg-card md:p-6">
            <h2 className="font-display text-3xl uppercase text-primary">
              Casa da Pedra - O Artesanato que Conta a História de Saquarema
            </h2>
            <p className="mt-5 text-muted-foreground">
              A Casa da Pedra é um espaço onde a identidade cultural de
              Saquarema ganha forma pelas mãos de seus artesãos. O local
              valoriza os saberes tradicionais, a criatividade e a economia
              criativa, reunindo peças únicas que transformam materiais,
              memórias e inspirações do território em arte. Cada artesanato
              carrega a essência de Saquarema, representando as cores do mar, a
              cultura caiçara, a riqueza da natureza e tradições que atravessam
              gerações. Ao prestigiar o artesanato local, moradores e turistas
              conhecem a cultura do município, fortalecem os artistas da cidade
              e contribuem para a preservação de suas tradições e para o
              desenvolvimento da economia criativa.
            </p>
          </article>
          <article className="flex flex-col items-center justify-center text-center p-0 md:min-h-[420px] md:rounded-2xl md:border md:border-border md:bg-card md:p-8 md:shadow-sm">
            <h2 className="font-display text-3xl uppercase text-primary">
              Artesanato Local
            </h2>
            <div className="mt-4 h-48 w-full md:h-64">
              <CarroselArtesanato />
            </div>
          </article>
        </div>
      </section>

      <AnimatePresence>
        {localSelecionado && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLocalSelecionado(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-card shadow-2xl border border-border"
            >
              <button
                onClick={() => setLocalSelecionado(null)}
                className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur-md transition-colors hover:bg-background"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
              {(() => {
                const src = safeMediaUrl(localSelecionado.imagemUrl);
                return src ? (
                  <div className="relative h-64 w-full bg-primary/20">
                    <Image
                      src={src}
                      alt={localSelecionado.nome}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                ) : null;
              })()}
              <div className="p-8">
                <h3 className="font-display text-3xl font-bold uppercase text-foreground">
                  {localSelecionado.nome}
                </h3>
                <div className="mt-6 prose prose-lg dark:prose-invert max-w-none">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {formatDisplayText(localSelecionado.texto || localSelecionado.descricao)}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
