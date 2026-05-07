"use client";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { useWaveData } from "@/hooks/API-Marinha";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const { data } = useWaveData();

  return (
    <>
      <Navbar
        weather={
          data
            ? {
                temperature: data.temperature,
                waveHeight: data.waveHeight,
              }
            : undefined
        }
      />
      <main>{children}</main>
      <Footer />
    </>
  );
}
