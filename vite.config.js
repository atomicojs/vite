import { defineConfig } from "vite";
import plugin from "./src/plugin.js";

export default defineConfig({
  build: {
    target: "esnext",
  },
  plugins: [plugin()],
});
