import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const rawBase = process.env.VITE_BASE_PATH || "/";
const base = rawBase.endsWith("/") ? rawBase : `${rawBase}/`;

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg", "icon-192.png", "icon-512.png", "apple-touch-icon.png"],
      manifest: {
        name: "Divergify",
        short_name: "Divergify",
        description: "Adaptive task planning with local-first support, focus, habits, and private guidance.",
        start_url: base,
        scope: base,
        display: "standalone",
        background_color: "#17193f",
        theme_color: "#17193f",
        icons: [
          {
            src: "icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      }
    })
  ],
  build: { sourcemap: false }
});
