/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Impede o Next.js de tentar fazer SSR do @react-pdf/renderer,
  // que e uma biblioteca exclusivamente client-side
  serverExternalPackages: ["@react-pdf/renderer"],
};

export default nextConfig;
