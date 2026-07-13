import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "commons.wikimedia.org",
        pathname: "/wiki/Special:FilePath/**"
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/**"
      }
    ]
  },
  turbopack: {
    root: projectRoot
  }
};

export default nextConfig;
