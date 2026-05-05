import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["**/__tests__/**/*.test.js"],
    hookTimeout: 30000,
    testTimeout: 30000,
  },
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "../shared"),
      "@utils": path.resolve(__dirname, "utils"),
    },
  },
});
