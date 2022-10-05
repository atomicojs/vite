#!/usr/bin/env node
import { build } from "vite";
import glob from "fast-glob";
import cac from "cac";
import { getModules } from "@atomico/exports/utils";
import { readFile } from "fs/promises";

const cli = cac("devserver").version("2.0.0");

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
                    "node_modules",
                    "**/_*/*",
                    "**/*.{test,spec}.{js,jsx,ts,tsx,mjs}",
                    "**/_*.{js,jsx,ts,tsx,mjs}",
                ],
            });

            /**
             * @type {{dependencies:{[index:string]:string}}}
             */
            const pkg = JSON.parse(
                await readFile(process.cwd() + "/package.json", "utf8")
            );

            const dependencies = pkg.dependencies
                ? Object.keys(pkg.dependencies)
                : [];

            await build({
                build: {
                    minify: minify != null,
                    watch,
                    target,
                    outDir: dist,
                    rollupOptions: {
                        input: getModules(files).reduce(
                            (files, [name, file]) => ({
                                ...files,
                                [name]: file,
                            }),
                            {}
                        ),
                        output: {
                            entryFileNames(chunk) {
                                return `${chunk.name}.js`;
                            },
                        },
                        external: (source) =>
                            dependencies.some(
                                (dep) =>
                                    dep === source ||
                                    source.startsWith(dep + "/")
                            ),
                    },
                },
            });
        }
    );

cli.help();

cli.parse();
