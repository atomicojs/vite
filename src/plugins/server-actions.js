import { pathToRegExp, tsMatch } from "./utils.js";
import { init, parse } from "es-module-lexer";
import { mkdir, rm } from "fs/promises";
import { build } from "esbuild";
import { template } from "../utils.js";

const TYPE_VERCEL = "vercel";

const PATHS = {
	[TYPE_VERCEL]: {
		src: "./api/",
		href: "/api/",
	},
};
/**
 * @typedef {Object} OptionsServerActions
 * @property {string}  [src]
 * @property {TYPE_VERCEL}  [type]
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
	const apiDir = typeConfig.src + folder;
	const srcBase = src.replace("/**/*", "/");

	const compile = (src) =>
		build({
			entryPoints: [src],
			outdir: apiDir + "/_",
			platform: "node",
			bundle: false,
			target: "ESNext",
		});

	return {
		name: "atomico-plugin-server-actions",
		async config() {
			try {
				await rm(apiDir, { recursive: true });
			} catch {
			} finally {
				await mkdir(apiDir + "/_", {
					recursive: true,
				});
			}
			if (type === TYPE_VERCEL) {
				await compile(src);

				await template("vercel-serverless.js", `${apiDir}/index.js`);
			}
		},
		async transform(code, id) {
			if (!tsMatch(id, [src])) return;

			const [file] = id.match(pathToRegExp(src));

			await init;

			const [imports, exports] = parse(code);

			const idFile = Buffer.from(
				file.replace(srcBase, "").replace(/\.(ts)$/, ".js"),
			).toString("base64");

			await compile(id);

			return {
				code: [
					...imports
						.filter(({ n }) => /^\.\.?\//.test(n))
						.map(({ n }) => `import "${n}";`),
					...exports.map(
						({ n }) =>
							`export const ${n} = (data)=>fetch("${typeConfig.href}${folder}?id=${idFile}&use=${n}",{method:"POST",body:JSON.stringify(data)}).then(res=>res.json());`,
					),
				].join("\n"),
			};
		},
	};
}
