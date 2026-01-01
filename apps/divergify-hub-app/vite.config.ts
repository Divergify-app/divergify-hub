import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/app/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg"],
      manifest: {
        name: "Divergify",
        short_name: "Divergify",
        description: "A bridge between outdated systems and future-forward brains.",
        start_url: "/app/",
        scope: "/app/",
        display: "standalone",
        background_color: "#00466C",
        theme_color: "#00466C",
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
