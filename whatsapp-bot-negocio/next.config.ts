import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/other-proyect",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
