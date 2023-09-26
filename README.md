# @atomico/plugin-vite

## this package is now called [@atomico/vite](https://github.com/atomicojs/vite)

configuration for Vite + Atomico, this plugin sets the necessary configuration to use Atomico + Jsx within vite.

## Usage

```jsx
import { defineConfig } from "vite";
import atomico from "@atomico/plugin-vite";

export default defineConfig({
	build: {
		target: "esnext",
		lib: {},
	},
	plugins: [
		...atomico({
			jsx: true, // default true
			cssLiterals: {
				minify: true, // default false
				postcss: true, // default false
			},
		}),
	],
});
```

## CLI

This package incorporates a CLI to facilitate the export of libraries through vite, example:

```bash
atomico-vite src/**/*
# alias
library src/**/*
```

The above script will create the files according to your current vite.config.js configuration, but in a directory called `lib` and with a simple name.
