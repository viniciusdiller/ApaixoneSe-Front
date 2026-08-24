"use client";

import { motion } from "framer-motion";

export default function CarrosselLogo() {
  const imagens = [
    "/images/cultura/1.jpg",
    "/images/cultura/2.jpg",
    "/images/cultura/3.jpg",
    "/images/cultura/4.jpg",
    "/images/cultura/5.jpg",
    "/images/cultura/6.jpg",
    "/images/cultura/7.jpg",
    "/images/cultura/8.jpg",
    "/images/cultura/9.jpg",
  ];

  const imagensDuplicadas = [...imagens, ...imagens];

  return (
    // O container principal ocupa 100% do tamanho (w-full h-full) da div pai
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
      <div className="relative h-full w-full overflow-hidden">
        {/* Contêiner Animado: O w-max aqui é vital para o loop infinito funcionar! */}
        <motion.div
          className="flex h-full w-max items-center gap-6 px-6 md:gap-8"
          animate={{
            x: ["0%", "-50%"],
          }}
          transition={{
            ease: "linear",
            duration: 50,
            repeat: Infinity,
          }}
        >
          {imagensDuplicadas.map((src, index) => (
            <div
              key={index}
              className="group relative flex h-full w-32 shrink-0 items-center justify-center sm:w-40"
            >
              <img
                src={src}
                alt={`Logo parceiro ${index}`}
                className="max-h-full max-w-full object-contain transition-all duration-300 hover:scale-105 rounded-md "
              />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
