"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Waves, X, Volume2, VolumeX } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { GoogleTranslate } from "./google-translate";

const navLinks = [
  { label: "Praias", to: "/praias" },
  { label: "Cultura", to: "/cultura" },
  { label: "Eventos", to: "/eventos" },
  { label: "Gastronomia", to: "/gastronomia" },
  { label: "Hospedagem", to: "" },
  { label: "Serviços Para o Turista", to: "/servicos" },
  { label: "Explore Saqua", to: "https://meidesaqua.saquarema.rj.gov.br/" },
];

interface WeatherData {
  temperature?: number;
  waveHeight?: number;
}

export function Navbar({ weather }: { weather?: WeatherData }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const monitorIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isLoopingRef = useRef(false);

  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    audioRef.current = new Audio("/sounds/ondas.mp3");
    audioRef.current.volume = 0;
    audioRef.current.loop = false; 

    return () => {
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      if (monitorIntervalRef.current) clearInterval(monitorIntervalRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const fadeAudio = (targetVol: number, durationMs: number): Promise<void> => {
    return new Promise((resolve) => {
      if (!audioRef.current) return resolve();

      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

      const startVol = audioRef.current.volume;
      const steps = 30; 
      const stepTime = durationMs / steps;
      const volStep = (targetVol - startVol) / steps;
      let currentStep = 0;

      fadeIntervalRef.current = setInterval(() => {
        if (!audioRef.current) {
          if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
          return resolve();
        }

        currentStep++;
        let newVol = startVol + volStep * currentStep;

        newVol = Math.max(0, Math.min(newVol, 1));
        audioRef.current.volume = newVol;

        if (currentStep >= steps) {
          if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
          audioRef.current.volume = targetVol;
          resolve();
        }
      }, stepTime);
    });
  };

  useEffect(() => {
    if (!isPlaying) {
      if (monitorIntervalRef.current) clearInterval(monitorIntervalRef.current);
      return;
    }

    monitorIntervalRef.current = setInterval(() => {
      const audio = audioRef.current;
      if (!audio || !audio.duration || isLoopingRef.current) return;

      const timeRemaining = audio.duration - audio.currentTime;

      if (timeRemaining <= 2.0 && timeRemaining > 0) {
        isLoopingRef.current = true;

        fadeAudio(0, timeRemaining * 1000).then(() => {
          if (!audioRef.current || !isPlaying) return;

          audioRef.current.currentTime = 0;
          audioRef.current
            .play()
            .then(() => {
              fadeAudio(0.5, 1500).then(() => {
                isLoopingRef.current = false;
              });
            })
            .catch(() => {
              isLoopingRef.current = false;
            });
        });
      }
    }, 300); 

    return () => {
      if (monitorIntervalRef.current) clearInterval(monitorIntervalRef.current);
    };
  }, [isPlaying]);

  const toggleAudio = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      setIsPlaying(false);
      // Fade-Out de 1 segundo ao pausar
      fadeAudio(0, 1000).then(() => {
        audioRef.current?.pause();
      });
    } else {
      setIsPlaying(true);
      isLoopingRef.current = false;

      if (
        audioRef.current.duration &&
        audioRef.current.duration - audioRef.current.currentTime <= 2
      ) {
        audioRef.current.currentTime = 0;
      }

      audioRef.current.volume = 0;
      audioRef.current
        .play()
        .then(() => {
          // Fade-In de 1.5 segundos ao dar play (bem suave)
          fadeAudio(0.5, 1500);
        })
        .catch((error) => {
          console.error("Erro ao reproduzir o áudio:", error);
          setIsPlaying(false);
          alert(
            "Não foi possível tocar o áudio. Verifique se o arquivo está na pasta 'public/sounds/ondas.mp3'.",
          );
        });
    }
  };

  const bgClass =
    scrolled || !isHome
      ? "bg-primary/95 backdrop-blur-md shadow-lg py-3"
      : "bg-transparent py-5";

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${bgClass}`}
    >
      <nav className="container mx-auto flex items-center justify-between px-4">
        
        <div className="flex items-center gap-4 md:gap-0">
          
          <button
            className="text-primary-foreground md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>

          <Link
            href="/"
            className="flex items-center gap-2 text-primary-foreground"
          >
            <Waves className="hidden h-10 w-10 md:block" />
            <div>
              <span className="font-display text-xl font-bold tracking-wide notranslate">
                APAIXONE-SE
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">
                {" "}
                Saquarema/rj - BR
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">
                Capital Nacional do Surf
              </span>
            </div>
          </Link>
        </div>

        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.to}>
              <Link
                href={link.to}
                className="relative text-sm font-medium uppercase tracking-wide text-primary-foreground/90 transition-colors after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-accent after:transition-all hover:text-primary-foreground hover:after:w-full"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3 md:gap-4">
          
          <GoogleTranslate />

          <button
            onClick={toggleAudio}
            className="text-primary-foreground md:hidden"
            aria-label="Alternar som das ondas"
          >
            {isPlaying ? (
              <Volume2 className="h-6 w-6" />
            ) : (
              <VolumeX className="h-6 w-6" />
            )}
          </button>

          <div className="hidden items-center gap-4 md:flex">
            {weather?.temperature !== undefined && (
              <div className="flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1.5 text-xs font-medium text-primary-foreground">
                <span>☀ {weather.temperature}°C</span>
                <span className="opacity-60">|</span>
                <span>🌊 {weather.waveHeight?.toFixed(1) ?? "--"}m</span>
              </div>
            )}

            <button
              onClick={toggleAudio}
              className="text-primary-foreground/80 transition-colors hover:text-primary-foreground"
              aria-label="Alternar som das ondas"
            >
              {isPlaying ? (
                <Volume2 className="h-5 w-5" />
              ) : (
                <VolumeX className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-primary/95 backdrop-blur-md md:hidden"
          >
            <ul className="flex flex-col items-center gap-4 py-6">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    href={link.to}
                    onClick={() => setMobileOpen(false)}
                    className="font-display text-lg uppercase tracking-wide text-primary-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {weather?.temperature !== undefined && (
                <li className="flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2 text-sm text-primary-foreground">
                  <span>☀ {weather.temperature}°C</span>
                  <span>|</span>
                  <span>🌊 {weather.waveHeight?.toFixed(1) ?? "--"}m</span>
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}