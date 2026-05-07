"use client";

import { useEffect, useState } from "react";
import { defaultWaveData, type WaveData } from "@/lib/Dados-Praia";

export function useWaveData({ lat, lng }: { lat?: number; lng?: number } = {}) {
  const [data, setData] = useState<WaveData | null>(null);
  useEffect(() => {
    // Se não houver coordenadas (ex: carregamento inicial), não faz nada ou mantém o padrão
    if (!lat || !lng) return;

    const controller = new AbortController();
    const signal = controller.signal;

    async function loadData() {
      try {
        const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}&current=wave_height,wave_direction,wave_period`;
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m`;

        const res = await fetch(marineUrl, { signal });
        const weatherRes = await fetch(weatherUrl, { signal });

        if (!res.ok || !weatherRes.ok) {
          throw new Error(`Erro na API: ${res.status} / ${weatherRes.status}`);
        }

        const marine = await res.json();
        const weather = await weatherRes.json();

        // CORREÇÃO: Só atualiza se o sinal NÃO estiver abortado (!signal.aborted)
        if (!signal.aborted) {
          setData({
            waveHeight:
              marine?.current?.wave_height ?? defaultWaveData.waveHeight,
            waveDirection:
              marine?.current?.wave_direction ?? defaultWaveData.waveDirection,
            wavePeriod:
              marine?.current?.wave_period ?? defaultWaveData.wavePeriod,
            temperature:
              weather?.current?.temperature_2m ?? defaultWaveData.temperature,
            weatherCode:
              weather?.current?.weather_code ?? defaultWaveData.weatherCode,
            windSpeed:
              weather?.current?.wind_speed_10m ?? defaultWaveData.windSpeed,
            windDirection:
              weather?.current?.wind_direction_10m ??
              defaultWaveData.windDirection,
          });
        }
      } catch (error: any) {
        // Se o erro for de cancelamento (AbortError), não faz nada
        if (error.name === "AbortError") return;

        console.error("Erro ao carregar dados da API:", error);
      }
    }

    loadData();

    return () => {
      controller.abort();
    };
  }, [lat, lng]); // Re-executa quando a latitude ou longitude mudar

  return { data };
}
