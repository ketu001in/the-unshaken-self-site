import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "amaxinhkybanuhczowro.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    // Turbopack normally runs Node-side build work (PostCSS/Tailwind,
    // webpack-style loaders) in a spawned child process. Resource-limited
    // containers — notably Hostinger's shared/Business Node.js hosting —
    // kill that child process before it can report why, surfacing as an
    // opaque "node process exited... status: 0" TurbopackInternalError on
    // globals.css. Running that work on worker threads inside the main
    // build process instead avoids spawning anything, which is Next.js's
    // own documented fix for this class of host.
    turbopackPluginRuntimeStrategy: "workerThreads",
  },
};

export default nextConfig;
