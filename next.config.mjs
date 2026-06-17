/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // O @react-pdf/renderer é importado dinamicamente apenas no browser.
};

export default nextConfig;
