import { HospedagensClient } from "./HospedagensClient";

export default function HospedagensPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero / cabeçalho da seção */}
      <section className="relative overflow-hidden bg-primary px-4 pb-16 pt-32">
        {/* Ícone decorativo */}
        <span
          aria-hidden
          className="absolute right-8 top-1/2 -translate-y-1/2 select-none text-[160px] opacity-10"
        >
          🏨
        </span>

        <div className="container relative z-10 mx-auto">
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-primary-foreground/60">
            Onde ficar
          </p>
          <h1 className="font-display text-5xl font-bold uppercase text-primary-foreground drop-shadow-lg md:text-6xl">
            Hospedagens
          </h1>
          <p className="mt-4 max-w-xl text-lg text-primary-foreground/80">
            Conheça os melhores locais para se hospedar em Saquarema e garanta
            uma estadia inesquecível.
          </p>
        </div>
      </section>

      {/* Listagem */}
      <section className="px-4 py-16">
        <div className="container mx-auto max-w-6xl">
          <HospedagensClient />
        </div>
      </section>
    </main>
  );
}
