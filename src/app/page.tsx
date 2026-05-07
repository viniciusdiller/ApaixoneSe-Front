import { BentoGrid } from "@/components/Experiencias-Únicas";
import { HeroSection } from "@/components/hero-section";
import { LiveSection } from "@/components/live-section";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <BentoGrid />
      <LiveSection />
    </div>
  );
}
