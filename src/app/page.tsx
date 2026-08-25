import { BentoGrid } from "@/components/Experiencias-Únicas";
import { FiquePorDentroSection } from "@/components/fique-por-dentro-section";
import { HeroSection } from "@/components/hero-section";
import { LiveSection } from "@/components/live-section";
import { AccountCta } from "@/components/account-cta";
import { HomeClickTracker } from "@/components/HomeClickTracker";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <HomeClickTracker />
      <HeroSection />
      <AccountCta />
      <FiquePorDentroSection />
      <BentoGrid />
      <LiveSection />
    </div>
  );
}
