import { defineConfig } from "vite";
import plugin from "./src/plugin.js";

export default defineConfig({
  build: {
    target: "esnext",
  },
  test: {
    environment: "node",
  },
  plugins: [plugin({ cssLiterals: { minify: true, postcss: true } })],
});
