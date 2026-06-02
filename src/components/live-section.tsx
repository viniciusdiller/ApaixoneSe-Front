"use client";

import {
  Calendar,
  Compass,
  Loader2,
  Thermometer,
  Waves,
  Wind,
} from "lucide-react";
import { useWaveData } from "@/hooks/API-Marinha";
import { motion } from "framer-motion";
import Link from "next/link";

const ITAUNA_COORDS = { lat: -22.9329, lng: -42.4823 };

function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-6 h-[180px] flex flex-col justify-center items-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary-foreground/20" />
    </div>
  );
}

function getWindLabel(deg: number) {
  const dirs = ["N", "NE", "L", "SE", "S", "SO", "O", "NO"];
  return dirs[Math.round(deg / 45) % 8];
}

function getWeatherLabel(code: number) {
  if (code <= 1) return "☀ Céu limpo";
  if (code <= 3) return "⛅ Parcialmente nublado";
  if (code <= 48) return "☁ Nublado";
  if (code <= 67) return "🌧 Chuva";
  return "⛈ Tempestade";
}

export function LiveSection() {
  const { data } = useWaveData(ITAUNA_COORDS);
  const eventDate = new Date("2026-06-19T08:00:00Z");
  const daysLeft = Math.max(
    0,
    Math.ceil((eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  );

  return (
    <section className="bg-foreground px-4 py-16">
      <div className="container mx-auto">
        <h2 className="mb-2 text-center font-display text-3xl font-bold uppercase text-primary-foreground md:text-4xl">
          Saquarema Ao Vivo
        </h2>
        <p className="mb-10 text-center font-handwritten text-xl text-primary-foreground/60">
          Dados em tempo real das condições do mar de Itaúna
        </p>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
          {!data ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-6"
              >
                <div className="mb-4 flex items-center gap-2 text-secondary">
                  <Waves className="h-5 w-5" />
                  <span className="font-display text-sm uppercase tracking-wide">
                    Previsão de Surf
                  </span>
                </div>
                <p className="font-display text-4xl font-bold text-primary-foreground">
                  {data.waveHeight.toFixed(1)}m
                </p>
                <div className="mt-3 space-y-1.5 text-sm text-primary-foreground/70">
                  <div className="flex items-center gap-2">
                    <Compass className="h-4 w-4" />
                    <span>Direção: {getWindLabel(data.waveDirection)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>⏱</span>
                    <span>Período: {data.wavePeriod.toFixed(0)}s</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-6"
              >
                <div className="mb-4 flex items-center gap-2 text-accent">
                  <Thermometer className="h-5 w-5" />
                  <span className="font-display text-sm uppercase tracking-wide">
                    Clima Agora
                  </span>
                </div>
                <p className="font-display text-4xl font-bold text-primary-foreground">
                  {data.temperature.toFixed(0)}°C
                </p>
                <div className="mt-3 space-y-1.5 text-sm text-primary-foreground/70">
                  <p>{getWeatherLabel(data.weatherCode)}</p>
                  <div className="flex items-center gap-2">
                    <Wind className="h-4 w-4" />
                    <span>
                      Vento: {data.windSpeed.toFixed(0)} km/h{" "}
                      {getWindLabel(data.windDirection)}
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-6"
              >
                <div className="mb-4 flex items-center gap-2 text-restinga">
                  <Calendar className="h-5 w-5" />
                  <span className="font-display text-sm uppercase tracking-wide">
                    Próximo Evento
                  </span>
                </div>
                <p className="font-display text-4xl font-bold text-primary-foreground">
                  {daysLeft} <span className="text-lg">dias</span>
                </p>
                <p className="mt-3 text-sm text-primary-foreground/70">
                  para o{" "}
                  <strong className="text-accent">Saquarema Pro 2026</strong>
                </p>
                <p className="mt-1 text-xs text-primary-foreground/50">
                  WSL Championship Tour
                </p>
              </motion.div>
            </>
          )}
        </div>
      </div>

      <div className="">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 flex gap-4 flex-row justify-center"
        >
          <Link
            href="/praias"
            className="rounded-full bg-accent px-6 py-2 font-display text-lg font-semibold uppercase tracking-wide text-accent-foreground shadow-xl transition-transform hover:scale-105"
          >
            Veja as outras praias
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
