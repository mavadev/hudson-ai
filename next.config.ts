import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  allowedDevOrigins: ["blue-monkeys-remain.loca.lt", "*.loca.lt"],
};

export default nextConfig;
