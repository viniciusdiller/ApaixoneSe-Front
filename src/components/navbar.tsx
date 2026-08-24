"use client";

import { notify } from "@/lib/feedback";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  Waves,
  X,
  Volume2,
  VolumeX,
  LogIn,
  LogOut,
  User,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { GoogleTranslate } from "./google-translate";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { label: "Praias & Lagoas", to: "/praias" },
  { label: "História", to: "/historia" },
  { label: "Eventos", to: "/eventos" },
  { label: "Gastronomia", to: "/gastronomia" },
  { label: "Hospedagem", to: "/hospedagens" },
  { label: "Serviços Para o Turista", to: "/servicos" },
];

interface WeatherData {
  temperature?: number;
  waveHeight?: number;
}

export function Navbar({ weather }: { weather?: WeatherData }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const monitorIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isLoopingRef = useRef(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";

  const { user, logout } = useAuth();

  // Fecha o menu do usuário ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          fadeAudio(0.5, 1500);
        })
        .catch((error) => {
          console.error("Erro ao reproduzir o áudio:", error);
          setIsPlaying(false);
          notify.error(
            "Não foi possível tocar o áudio. Verifique se o arquivo está na pasta 'public/sounds/ondas.mp3'.",
          );
        });
    }
  };

  function handleLogout() {
    logout();
    setUserMenuOpen(false);
    setMobileOpen(false);
    router.push("/");
  }

  const bgClass =
    scrolled || !isHome
      ? "bg-primary/95 backdrop-blur-md shadow-lg py-3"
      : "bg-transparent py-5";

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${bgClass}`}
    >
      <nav className="flex justify-between px-4">
        {/* Logo + hambúrguer */}
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
              <img
                src="/images/apaixone-se-Branco.png"
                alt="Logo Apaixone-se"
                height={95}
                width={95}
              />
            </div>
          </Link>
        </div>

        {/* Nav Links desktop */}
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

        {/* Ações direita */}
        <div className="flex items-center gap-3 md:gap-4">
          <GoogleTranslate />

          {/* Botão som — mobile (sempre visível na barra) */}
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

          {/*
           * AUTH — desktop only.
           * No mobile o hambúrguer já contém os itens de auth,
           * por isso ocultamos com "hidden md:flex".
           */}
          <div className="hidden items-center gap-2 md:flex">
            {!user ? (
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary-foreground/25"
              >
                <LogIn className="h-3.5 w-3.5" />
                Entrar
              </Link>
            ) : user.perfil === "ADMIN" ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-primary transition hover:opacity-90"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span>Painel Admin</span>
                </Link>
                <Link
                  href="/perfil"
                  className="flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary-foreground/25"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>Meu Perfil</span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Sair"
                  className="flex items-center gap-1 rounded-full bg-primary-foreground/15 px-2 py-1.5 text-xs text-primary-foreground transition hover:bg-primary-foreground/25"
                >
                  <p>Sair</p>
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary-foreground/25"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-primary">
                    {user.nome?.charAt(0).toUpperCase() ?? (
                      <User className="h-3 w-3" />
                    )}
                  </div>
                  <span className="max-w-[80px] truncate">
                    {user.nome?.split(" ")[0]}
                  </span>
                  <ChevronDown
                    className={`h-3 w-3 transition-transform ${
                      userMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-10 z-50 min-w-[160px] rounded-xl border border-border bg-card shadow-lg"
                    >
                      <div className="border-b border-border px-4 py-3">
                        <p className="text-xs font-semibold text-foreground">
                          {user.nome}
                        </p>
                        <p className="text-[10px] text-muted-foreground capitalize">
                          {user.perfil.toLowerCase()}
                        </p>
                      </div>
                      <div className="p-1">
                        <Link
                          href="/perfil"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-foreground transition hover:bg-muted"
                        >
                          <User className="h-3.5 w-3.5" />
                          Meu Perfil
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-destructive transition hover:bg-destructive/10"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          Sair
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Som + clima — desktop */}
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

      {/* ── Menu mobile ────────────────────────────────────────────────── */}
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

              {/* Divisor visual */}
              <li
                className="w-32 border-t border-primary-foreground/20"
                aria-hidden
              />

              {/* Auth — visível apenas no hambúrguer (mobile) */}
              {!user ? (
                <li>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-full bg-primary-foreground/20 px-5 py-2 font-display text-sm uppercase tracking-wide text-primary-foreground"
                  >
                    <LogIn className="h-4 w-4" /> Entrar
                  </Link>
                </li>
              ) : (
                <>
                  {/* Saudação */}
                  <li className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-primary">
                      {user.nome?.charAt(0).toUpperCase() ?? (
                        <User className="h-4 w-4" />
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-primary-foreground">
                        {user.nome?.split(" ")[0]}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-primary-foreground/60">
                        {user.perfil}
                      </p>
                    </div>
                  </li>

                  {user.perfil === "ADMIN" && (
                    <li>
                      <Link
                        href="/admin"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 rounded-full bg-accent px-5 py-2 font-display text-sm uppercase tracking-wide text-primary"
                      >
                        <LayoutDashboard className="h-4 w-4" /> Painel Admin
                      </Link>
                    </li>
                  )}

                  <li>
                    <Link
                      href="/perfil"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 rounded-full bg-primary-foreground/20 px-5 py-2 font-display text-sm uppercase tracking-wide text-primary-foreground"
                    >
                      <User className="h-4 w-4" /> Meu Perfil
                    </Link>
                  </li>

                  <li>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-sm text-primary-foreground/70 transition hover:text-primary-foreground"
                    >
                      <LogOut className="h-4 w-4" /> Sair
                    </button>
                  </li>
                </>
              )}

              {/* Clima — mobile */}
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
