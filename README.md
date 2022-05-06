# @atomico/plugin-vite

configuration for Vite + Atomico, this plugin sets the necessary configuration to use Atomico + Jsx within vite.

## Usage

```jsx
import { defineConfig } from "vite";
import atomico from "@atomico/plugin-vite";

export default defineConfig({
  build: {
    target: "esnext",
  },
  plugins: [
    atomico({
      jsx: true, // default true
      cssLiterals: {
        minify: true, // default false
        postcss: true, // default false
      },
    }),
  ],
});
```
