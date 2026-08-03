"use client";

import { motion } from "framer-motion";

export default function CarrosselLogo() {
  const imagens = [
    "/images/pref/Pref.png",
    "/images/pref/LabISA.png",
    "/images/pref/Sec-Turismo.png",
    "/images/pref/SMGS.png",
  ];

  const imagensDuplicadas = [...imagens, ...imagens];

  return (
    // O container principal deve ocupar 100% da largura (w-full) para o carrossel cruzar a tela
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
      <div className="relative w-full overflow-hidden">
        {/* Contêiner Animado: O w-max aqui é vital para o loop infinito funcionar! */}
        <motion.div
          className="flex w-max items-center gap-6 px-6 md:gap-8"
          animate={{
            x: ["0%", "-50%"],
          }}
          transition={{
            ease: "linear",
            duration: 20, // Ajuste a velocidade aqui (15 a 20 costuma ser ideal)
            repeat: Infinity,
          }}
        >
          {imagensDuplicadas.map((src, index) => (
            <div
              key={index}
              className="group relative flex h-16 w-32 shrink-0 items-center justify-center sm:h-20 sm:w-40"
            >
              <img
                src={src}
                alt={`Logo parceiro ${index}`}
                className="max-h-full max-w-full object-contain opacity-70 transition-all duration-300 hover:scale-105 hover:opacity-100 "
              />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
