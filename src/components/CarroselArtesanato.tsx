"use client";

import { motion } from "framer-motion";

export default function CarroselArtesanato() {
  const imagens = [
    "/images/historia/1.jpg",
    "/images/historia/2.jpg",
    "/images/historia/3.jpg",
    "/images/historia/4.jpg",
    "/images/historia/5.jpg",
    "/images/historia/6.jpg",
    "/images/historia/7.jpg",
    "/images/historia/8.jpg",
    "/images/historia/9.jpg",
  ];

  const imagensDuplicadas = [...imagens, ...imagens];

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
      <div className="relative h-full w-full overflow-hidden">
        <motion.div
          className="flex h-full w-max items-center gap-6 px-6 md:gap-8"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            ease: "linear",
            duration: 50,
            repeat: Infinity,
          }}
        >
          {imagensDuplicadas.map((src, index) => (
            <div
              key={`${src}-${index}`}
              className="group relative flex h-full w-32 shrink-0 items-center justify-center sm:w-40"
            >
              <img
                src={src}
                alt={`Imagem de artesanato ${index + 1}`}
                className="max-h-full max-w-full rounded-md object-contain transition-all duration-300 hover:scale-105"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
