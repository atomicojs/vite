#!/usr/bin/env node
import { build } from "vite";
import glob from "fast-glob";
import cac from "cac";
import { parse } from "path";

const cli = cac("devserver").version("0.6.0");

cli.command("<...files>", "Build files")
    .option("--minify", "minify the code output")
    .option("--watch", "watch directory changes")
    .option("--dist <dist>", "change the output directory (default: lib)")
    .option("--target <target>", "minify the code output (default: esnext)")
    .action(
        /**
         *
         * @param {string} src
         * @param {object} options
         * @param {boolean} options.minify
         * @param {boolean} options.watch
         * @param {string} options.dist
         * @param {string} options.target
         */
        async (src, { minify, watch, dist = "lib", target = "esnext" }) => {
            const files = await glob(src, {
                ignore: [
                    "**/_*/*",
                    "**/*.*.{js,jsx,ts,tsx,mjs}",
                    "**/_*.{js,jsx,ts,tsx,mjs}",
                ],
            });

            await build({
                build: {
                    minify: minify != null,
                    watch,
                    target,
                    outDir: dist,
                    rollupOptions: {
                        input: files.reduce(
                            (files, file) => ({
                                ...files,
                                [parse(file).name]: file,
                            }),
                            {}
                        ),
                        output: {
                            entryFileNames(chunk) {
                                return `${chunk.name}.js`;
                            },
                        },
                    },
                },
            });
        }
    );

cli.help();

cli.parse();
