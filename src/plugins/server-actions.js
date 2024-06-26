import { init, parse } from "es-module-lexer";
import { build } from "esbuild";
import { mkdir, rm, writeFile } from "fs/promises";
import { getTmp } from "../tmp.js";
import { getTemplate } from "../utils.js";
import { copy, pathToRegExp, tsMatch } from "./utils.js";

const TYPE_VERCEL = "vercel";
const TYPE_CLOUDFLARE = "cloudflare";
const TYPE_NETLIFY = "netlify";

const PATHS = {
	[TYPE_VERCEL]: {
		src: "./api/",
		href: "/api/",
		template: "vercel-serverless.js",
	},
	[TYPE_CLOUDFLARE]: {
		src: "./functions/api/",
		href: "/api/",
		template: "cloudflare-pages.js",
	},
	[TYPE_NETLIFY]: {
		src: "./netlify/functions/",
		href: "/.netlify/functions/",
		template: "netlify-functions.js",
	},
};
/**
 * @typedef {Object} OptionsServerActions
 * @property {string}  [src]
 * @property {TYPE_VERCEL|TYPE_CLOUDFLARE|TYPE_NETLIFY}  [type]
 * @property {string}  [folder]
 */

/**
 * @param {OptionsServerActions} options
 * @returns {import("vite").Plugin}
 */
export function pluginServerActions({
	type = TYPE_VERCEL,
	folder = "server-actions",
	src = "src/api/**/*",
} = {}) {
	const typeConfig = PATHS[type];
	const apiDist = typeConfig.src + folder;
	const fileDir = apiDist + ".js";
	const srcBase = src.replace("/**/*", "/");

	const href = typeConfig.href;

	const tmpIndex = getTmp("server-actions/index.js");
	const tmpApi = getTmp("server-actions/_");

	const compile = async () => {
		await copy(srcBase, tmpApi);

		const { outputFiles } = await build({
			entryPoints: [tmpIndex],
			outdir: apiDist,
			platform: "node",
			bundle: true,
			target: "ESNext",
			format: "esm",
			write: false,
		});
		// Allows the observer to capture file change events
		const [{ text }] = outputFiles;
		await writeFile(fileDir, text);
	};

	return {
		name: "atomico-plugin-server-actions",
		async config(config) {
			try {
				await rm(fileDir, { recursive: true });
			} catch {
			} finally {
				await mkdir(typeConfig.src, { recursive: true });
			}

			const base = getTemplate(typeConfig.template);

			await copy(base, tmpIndex);

			await compile();

			return config;
		},
		async transform(code, id) {
			if (!tsMatch(id, [src])) return;

			const [file] = id.match(pathToRegExp(src));

			await init;

			const [imports, exports] = parse(code);

			const idFile = Buffer.from(file.replace(srcBase, "")).toString(
				"base64",
			);

			await compile();

			return {
				code: [
					`import { action } from "@atomico/vite/client/server-actions";`,
					...imports
						.filter(({ n }) => /^\.\.?\//.test(n))
						.map(({ n }) => `import "${n}";`),
					...exports.map(
						({ n }) =>
							`export const ${n} = (data)=>action("${href}${folder}?id=${idFile}&use=${n}",data,${/WithForm$/.test(
								n,
							)});`,
					),
				].join("\n"),
			};
		},
	};
}
