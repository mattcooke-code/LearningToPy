import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: "automatic",
    }),
    tailwindcss(),
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "../shared"),
    },
    dedupe: ["react", "react-dom"], // ADD THIS - prevents duplicate React
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react-dom/client",
      "lucide-react",
      "@shared/constants/progress.cjs",
      "@shared/constants/badgeDefinitions.cjs",
    ],
    force: true, // ADD THIS - forces re-optimization
  },
  build: {
    commonjsOptions: {
      include: [/shared/, /node_modules/], // ADD node_modules
      transformMixedEsModules: true,
    },
    rollupOptions: {
      external: [], // ADD THIS
      output: {
        manualChunks: undefined, // ADD THIS
      },
    },
  },
  ssr: {
    noExternal: [/shared/],
  },
});
