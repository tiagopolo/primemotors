import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // A logo e alguns cards pedem qualidade 100; sem isso o Next 16 recusa
    // a otimização e mostra o aviso "quality is not configured".
    qualities: [75, 100],
  },
};

export default nextConfig;
