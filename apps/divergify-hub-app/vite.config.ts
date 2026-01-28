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
      includeAssets: ["icon.svg"],
      manifest: {
        name: "Divergify",
        short_name: "Divergify",
        description: "A bridge between outdated systems and future-forward brains.",
        start_url: base,
        scope: base,
        display: "standalone",
        background_color: "#232147",
        theme_color: "#232147",
        icons: [
          {
            src: "icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable"
          }
        ]
      }
    })
  ],
  build: { sourcemap: false }
});
