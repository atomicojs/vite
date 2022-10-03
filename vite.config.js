import { defineConfig } from "vite";
import plugin from "./src/plugin.js";
import glob from "fast-glob";
import { parse } from "path";

const files = await glob("./example/**/*.{js,jsx,ts,tsx}");

const filesById = files.reduce(
    (files, file) => ({ ...files, [parse(file).name]: file }),
    {}
);

export default defineConfig({
    build: {
        target: "esnext",
        polyfillModulePreload: false,
        // rollupOptions: {
        //     input: map,
        //     output: {
        //         entryFileNames(chunk) {
        //             return `${chunk.name}.js`;
        //         },
        //     },
        // },
    },
    test: {
        environment: "node",
    },
    plugins: [...plugin({ cssLiterals: { minify: true, postcss: true } })],
});
