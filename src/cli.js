#!/usr/bin/env node
import { getModules } from "@atomico/exports/utils";
import cac from "cac";
import glob from "fast-glob";
import { readFile } from "fs/promises";
import { join, normalize, relative } from "path";
import { build } from "vite";
import { isJs, md5 } from "./plugins/utils.js";
import { getTmp, write } from "./tmp.js";
import { getExtensions } from "./utils.js";

const cli = cac("@atomico/vite").version("2.2.1");

cli.command("<...files>", "Build files")
	.option("--minify", "minify the code output")
	.option("--watch", "watch directory changes")
	.option(
		"--all-external",
		"This flag allows all dependencies to be external",
	)
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
		 * @param {boolean} options.allExternal
		 */
		async (
			src,
			{
				minify,
				watch,
				dist = "lib",
				target = "esnext",
				sourcemap,
				allExternal,
			},
		) => {
			const cwd = process.cwd();

			const types = getExtensions(src);

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
				).filter(types ? (file) => types.test(file) : isJs),
			);

			const tmp = getTmp(`lib-${Date.now()}.js`);

			global.ATOMICO_VITE_CLI = { files, tmp };

			const filesAbsolute = files.reduce(
				(filesAbsolute, [name, file]) => ({
					...filesAbsolute,
					[join(cwd, file)]: name,
				}),
				{},
			);

			/**
			 * @type {{dependencies:{[index:string]:string}, peerDependencies:{[index:string]:string}}}
			 */
			const pkg = JSON.parse(
				await readFile(cwd + "/package.json", "utf8"),
			);

			const externals = Object.keys({
				...pkg?.dependencies,
				...pkg?.peerDependencies,
			});

			await write(
				tmp,
				Object.entries(filesAbsolute).map(
					([absolute]) =>
						`import("${relative(tmp, absolute)
							.replace(/\\/g, "/")
							.replace("../", "")}");`,
				),
			);

			try {
				await build({
					build: {
						sourcemap: sourcemap != null,
						modulePreload: false,
						cssCodeSplit: false,
						minify: minify != null,
						watch,
						target,
						outDir: dist,
						lib: {
							entry: tmp,
							formats: ["es"],
						},
						rollupOptions: {
							treeshake: false,
							output: {
								format: "es",
								chunkFileNames({ facadeModuleId, ...data }) {
									const id = facadeModuleId
										? normalize(facadeModuleId)
										: JSON.stringify(data);
									return id in filesAbsolute
										? `${filesAbsolute[id] || "index"}.js`
										: `chunks/${md5(id)}.js`;
								},
							},
							external: (source) => {
								// Url and node are external
								if (/^(http(s)?|node){0,1}:.+/.test(source))
									return true;

								// Disk and local files resources are not external
								if (/^(\w|file):.+/.test(source)) return false;

								// All packages are external
								if (allExternal) return /^@?\w+/.test(source);

								return externals.some(
									(dep) =>
										dep === source ||
										source.startsWith(dep + "/"),
								);
							},
						},
					},
				});
			} finally {
				// await unlink(tmp);
			}
		},
	);

cli.help();

cli.parse();
