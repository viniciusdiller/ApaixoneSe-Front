import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BentoGrid } from "@/components/Experiencias-Únicas";
import { CadasturSection } from "@/components/CadasturSection";

export default function RoteirosPage() {
  return (
    <div className="min-h-screen bg-background">
      <section
        className="relative overflow-hidden bg-cover bg-center px-4 pb-16 pt-32"
        style={{ 
          backgroundImage: "url('/images/roteiros/ecologico.jpeg')" ,
          backgroundSize: "100%",
          backgroundPosition: "center 40%",
        }}
      >
        <div className="absolute inset-0 bg-black/55" />
        <div className="container relative z-10 mx-auto">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2 text-sm text-primary-foreground/80 transition-colors hover:bg-primary-foreground/20 hover:text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para página inicial
          </Link>
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-primary-foreground/60">
            Experiências únicas
          </p>
          <h1 className="font-display text-5xl font-bold uppercase text-primary-foreground drop-shadow-lg md:text-6xl">
            Roteiros
          </h1>
          <p className="mt-4 max-w-xl text-lg text-primary-foreground/80">
            Descubra o que faz de Saquarema um destino inesquecível.
          </p>
        </div>
      </section>

            <BentoGrid />

      <section className="container mx-auto px-4 pb-14 pt-2">
        <CadasturSection />
      </section>

      
    </div>
  );
}
