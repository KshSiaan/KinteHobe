import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents:true,
  reactCompiler:true,
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
      }
    ],
  },
};

export default nextConfig;
