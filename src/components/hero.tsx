export function Hero({
  title,
  subtitle,
  image,
}: {
  title: string;
  subtitle: string;
  image: string;
}) {
  return (
    <section className="relative flex h-[70vh] items-center justify-center overflow-hidden text-center">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/30 to-black/30" />
      <div className="relative z-10 px-4 text-primary-foreground">
        <p className="mb-4 text-sm uppercase tracking-[0.3em]">
          Bem-vindo ao Maracanã do Surf
        </p>
        <h1 className="font-display text-5xl font-bold uppercase md:text-7xl">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/85">
          {subtitle}
        </p>
      </div>
    </section>
  );
}
