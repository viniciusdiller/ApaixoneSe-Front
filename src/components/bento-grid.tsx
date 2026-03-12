import Link from "next/link";
import { ArrowRight } from "lucide-react";

const experiences = [
  {
    title: "Itaúna: O Maracanã do Surf",
    description: "Ondas de classe mundial e etapas da WSL",
    image: "/images/itauna-surf.jpg",
    link: "/praias/itauna",
    span: "md:col-span-2 md:row-span-2",
  },
  {
    title: "Igreja de Nazaré",
    description: "Fé e história desde 1630",
    image: "/images/igreja-nazare.jpg",
    link: "/cultura",
    span: "md:row-span-2",
  },
  {
    title: "Gastronomia Caiçara",
    description: "Sabores do mar na sua mesa",
    image: "/images/gastronomia.jpg",
    link: "/gastronomia",
    span: "md:col-span-2",
  },
  {
    title: "Vôlei CBV",
    description: "Casa das seleções campeãs",
    image: "/images/volei-cbv.jpg",
    link: "/eventos",
    span: "",
  },
  {
    title: "Templo do Rock",
    description: "O legado de Serguei vive aqui",
    image: "/images/templo-rock.jpg",
    link: "/cultura",
    span: "",
  },
];

export function BentoGrid() {
  return (
    <section className="px-4 py-20">
      <div className="container mx-auto">
        <h2 className="mb-4 text-center font-display text-4xl font-bold uppercase text-foreground md:text-5xl">
          Roteiros de Experiências Únicas
        </h2>
        <p className="mx-auto mb-12 max-w-xl text-center text-muted-foreground">
          Descubra o que faz de Saquarema um destino inesquecível
        </p>

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-4">
          {experiences.map((exp) => (
            <Link
              key={exp.title}
              href={exp.link}
              className={`group relative min-h-[220px] overflow-hidden rounded-2xl ${exp.span}`}
            >
              <img
                src={exp.image}
                alt={exp.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity group-hover:from-black/80" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="font-display text-xl font-bold uppercase text-white md:text-2xl">
                  {exp.title}
                </h3>
                <p className="mt-1 text-sm text-white/80">{exp.description}</p>
              </div>
              <div className="absolute bottom-4 right-4 opacity-0 transition-opacity group-hover:opacity-100">
                <ArrowRight className="h-6 w-6 text-accent" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
