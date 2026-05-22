"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { useWaveData } from "@/hooks/API-Marinha";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  const { data } = useWaveData();

  if (isAdmin) {
    return <>{children}</>;
  }

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
