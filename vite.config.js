import { defineConfig } from "vite";
import plugin from "./src/plugin.js";

export default defineConfig({
  optimizeDeps: {
    // include: ["atomico", "atomico/jsx-runtime"],
  },
  build: {
    target: "esnext",
  },
  test: {
    environment: "node",
  },
  plugins: [plugin({ cssLiterals: { minify: true, postcss: true } })],
});
