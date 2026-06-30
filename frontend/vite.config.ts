import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true, // listen on the LAN so other devices/tunnels can reach the dev server
    allowedHosts: true, // accept tunnel hostnames (e.g. *.trycloudflare.com) in dev
    proxy: {
      // Forward token requests to the backend so the browser only ever talks to
      // one origin. Backend stays private; no CORS or mixed-content to manage.
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
})
