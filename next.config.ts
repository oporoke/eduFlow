import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    resolve: {
      alias: {
        "@": path.resolve(__dirname),
      },
    },
  },
  reactStrictMode: true,
};

export default nextConfig;