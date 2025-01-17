import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static HTML export (for Next.js with static sites)
  output: "export",  // This ensures that the app will be statically exported

  // Optional: Ensure trailing slashes for all URLs (e.g., `/about/` instead of `/about`)
  trailingSlash: true, 

  // Cloudflare Pages recommends using a custom build output directory
  // Here we specify where the static output will go
  distDir: "out",  // This is where `next export` will put the static files
  
  // Add any additional Next.js configurations if necessary
  // For example, enabling React Strict Mode
  reactStrictMode: true,

  // You can configure custom headers for your static export
  // headers: async () => {
  //   return [
  //     {
  //       source: "/(.*)",
  //       headers: [
  //         {
  //           key: "Cache-Control",
  //           value: "public, max-age=31536000, immutable",
  //         },
  //       ],
  //     },
  //   ];
  // },
};

export default nextConfig;
