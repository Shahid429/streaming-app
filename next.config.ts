import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Specify static export
  output: "export",  // This enables static HTML export
  trailingSlash: true, // Optional: Add trailing slashes to URLs (you can disable if you prefer without)

  // Additional Next.js configuration options can go here
};

export default nextConfig;
