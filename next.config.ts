import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   allowedDevOrigins: ['172.23.160.1', 'https://727c-175-157-72-32.ngrok-free.app', 'http://172.23.160.1:3000', 'https://0885-2402-4000-b110-fd9a-99d4-61bd-b2c5-339a.ngrok-free.app'],
  serverExternalPackages: ["postgres", "postgres-js"],
  images: {
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
  },
};

export default nextConfig;
