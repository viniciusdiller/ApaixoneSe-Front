import { RoteirosGrid } from "@/components/roteiros/RoteirosGrid";

export const metadata = {
  title: "Roteiros | Apaixone-se por Saquarema",
  description:
    "Explore os roteiros de viagem de Saquarema: A Pé, Esporte e Aventura, De Praias, Cultural, Religioso, Rural e Ecológico.",
};

export default function RoteirosPage() {
  return (
    <main className="min-h-screen bg-background pt-24">
      <RoteirosGrid />
    </main>
  );
}
