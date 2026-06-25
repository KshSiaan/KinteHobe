import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  serverExternalPackages:["pdf-parse"]
};

export default nextConfig;
