import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.js"],
    css: { modules: { classNameStrategy: "non-scoped" } },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "https://lab.chronicle.cz", changeOrigin: true },
      "/socket.io": { target: "https://lab.chronicle.cz", changeOrigin: true, ws: true },
    },
  },
});
