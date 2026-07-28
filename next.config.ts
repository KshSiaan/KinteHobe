import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
      {
        protocol: "https",
        hostname: "vedvzdqvtcsrgxdifhiq.supabase.co",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "securepay.sslcommerz.com",
      }
    ],
  },
  serverExternalPackages: ["pdf-parse"],
  allowedDevOrigins: ["192.168.0.195"],
};

export default nextConfig;
