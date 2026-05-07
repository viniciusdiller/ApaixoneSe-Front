"use client";

import { Compass, Thermometer, Waves, Wind, Loader2 } from "lucide-react";
import { useWaveData } from "@/hooks/API-Marinha";
import { ReactNode } from "react";

export function BeachConditions({ lat, lng }: { lat: number; lng: number }) {
  const { data } = useWaveData({ lat, lng });

  if (!data) {
    return (
      <div className="mb-12 flex justify-center py-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-4">
      <Card
        icon={<Waves className="h-5 w-5 text-secondary" />}
        label="Ondas"
        value={`${data.waveHeight.toFixed(1)}m`}
      />
      <Card
        icon={<Compass className="h-5 w-5 text-secondary" />}
        label="Período"
        value={`${data.wavePeriod.toFixed(0)}s`}
      />
      <Card
        icon={<Wind className="h-5 w-5 text-accent" />}
        label="Vento"
        value={`${data.windSpeed.toFixed(0)} km/h`}
      />
      <Card
        icon={<Thermometer className="h-5 w-5 text-accent" />}
        label="Temperatura"
        value={`${data.temperature.toFixed(0)}°C`}
      />
    </div>
  );
}

function Card({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 text-center">
      <div className="mb-2 flex justify-center">{icon}</div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-bold text-foreground">
        {value}
      </p>
    </div>
  );
}
