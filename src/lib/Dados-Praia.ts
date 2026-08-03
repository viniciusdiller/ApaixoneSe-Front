export interface WaveData {
  waveHeight: number;
  waveDirection: number;
  wavePeriod: number;
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  windDirection: number;
}

export const defaultWaveData: WaveData = {
  waveHeight: 1.4,
  waveDirection: 135,
  wavePeriod: 12,
  temperature: 27,
  weatherCode: 1,
  windSpeed: 16,
  windDirection: 120,
};
