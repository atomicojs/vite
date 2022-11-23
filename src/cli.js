#!/usr/bin/env node
import { build } from "vite";
import glob from "fast-glob";
import cac from "cac";
import { readFile } from "fs/promises";
import { getModules } from "@atomico/exports/utils";
import { join, normalize } from "path";
import { hash } from "@uppercod/hash";
import { isJs } from "./plugins/utils.js";

const cli = cac("devserver").version("2.2.1");

cli.command("<...files>", "Build files")
    .option("--minify", "minify the code output")
    .option("--watch", "watch directory changes")
    .option("--dist <dist>", "change the output directory (default: lib)")
    .option("--sourcemap", "enable the use of sourcemap")
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
         * @param {string} options.sourcemap
         */
        async (
            src,
            { minify, watch, dist = "lib", target = "esnext", sourcemap }
        ) => {
            const cwd = process.cwd();
            const files = getModules(
                (
                    await glob(src, {
                        ignore: [
                            "node_modules",
                            "**/_*/*",
                            "**/*.{test,spec,stories}.{js,jsx,ts,tsx,mjs}",
                            "**/_*.{js,jsx,ts,tsx,mjs}",
                        ],
                    })
                ).filter(isJs)
            );

            global.ATOMICO_VITE_CLI = files;

            const filesAbsolute = files.reduce(
                (filesAbsolute, [name, file]) => ({
                    ...filesAbsolute,
                    [join(cwd, file)]: name,
                }),
                {}
            );

            /**
             * @type {{dependencies:{[index:string]:string}, peerDependencies:{[index:string]:string}}}
             */
            const pkg = JSON.parse(
                await readFile(cwd + "/package.json", "utf8")
            );

            const externals = Object.keys({
                ...pkg?.dependencies,
                ...pkg?.peerDependencies,
            });

            await build({
                build: {
                    sourcemap: sourcemap != null,
                    polyfillModulePreload: false,
                    cssCodeSplit: false,
                    minify: minify != null,
                    watch,
                    target,
                    outDir: dist,
                    rollupOptions: {
                        input: [],
                        output: {
                            format: "es",
                            preserveModules: false,
                            chunkFileNames({ facadeModuleId, ...data }) {
                                const id = facadeModuleId
                                    ? normalize(facadeModuleId)
                                    : JSON.stringify(data);
                                return filesAbsolute[id]
                                    ? `${filesAbsolute[id]}.js`
                                    : `chunks/${hash(id)}.js`;
                            },
                        },
                        external: (source) => {
                            return externals.some(
                                (dep) =>
                                    dep === source ||
                                    source.startsWith(dep + "/")
                            );
                        },
                    },
                },
            });
        }
    );

cli.help();

cli.parse();
