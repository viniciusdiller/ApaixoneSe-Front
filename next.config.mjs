/** @type {import('next').NextConfig} */

const backendInternalUrl = "http://172.16.32.199:3305";

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "172.16.32.199",
        port: "3305",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "apaixonese.saquarema.rj.gov.br",
        pathname: "/**",
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendInternalUrl}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${backendInternalUrl}/api/uploads/:path*`,
      },
      {
        source: "/public/:path*",
        destination: `${backendInternalUrl}/api/public/:path*`,
      },
    ];
  },
};

export default nextConfig;
