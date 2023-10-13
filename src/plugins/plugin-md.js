import { hash } from "@uppercod/hash";
import * as acornWalk from "acorn-walk";
import { mkdir } from "fs/promises";
import MagicString from "magic-string";
import { lexer, parser } from "marked";
import { getTmp, write } from "../tmp";

/**
 * @typedef {{inject: boolean,render:{[type:string]:(token:import("marked").Token)=>import("marked").Token}}} OptionMd

/**
 * @type {Object<string,{files: Set<string>, id: string, src: string}>}
 */
const sources = {};

const createBlockHtml = (raw, text = raw) => ({
	type: "html",
	block: true,
	pre: false,
	raw,
	text,
});

/**
 *
 * @param {import("marked").Token} block
 */
const createBlockEntities = (block, replace) =>
	(replace || createBlockHtml)(
		`<pre><code class="language-${
			block.lang.split(" ").at(0) || "unknown"
		}" textContent="${block.text}"/></pre>`,
	);

/**
 * @param {OptionMd} option
 * @returns {import("vite").Plugin}
 */
export const pluginMd = ({ render = {}, inject } = {}) => ({
	name: "atomico-plugin-md",
	async transform(code, id) {
		if (id in sources) {
			const source = sources[id];
			const replace = [];

			acornWalk.ancestor(this.parse(code), {
				ImportDeclaration(node) {
					const src = node?.source?.value || "";
					const [, file] = src.match(/\/(\w+)$/) || [];
					if (!file) return;
					const check = RegExp(
						`^${
							/\.\w+$/.test(file)
								? file
								: file + ".(js|jsx|tsx|ts)"
						}$`.replace(/\./g, "\\."),
					);

					if ([...source.files].some((prop) => check.test(prop)))
						return;

					if (!src.startsWith(".")) return;

					replace.push([
						node.source,
						new URL(src, source.id + "/").href,
					]);
				},
			});

			const nextCode = new MagicString(code);

			replace.forEach(([{ start, end }, src]) =>
				nextCode.overwrite(start + 1, end - 1, src),
			);

			return {
				code: nextCode.toString(),
				map: nextCode.generateDecodedMap(),
			};
		}

		if (!id.endsWith(".md")) return;

		const blocks = lexer(code);

		const folder = hash(id);

		const files = new Set();

		const customBlock = await Promise.all(
			blocks.map(async (block, i) => {
				if (block.type === "code" && block.lang) {
					const options = block.lang.split(/\s+/);
					const [extension] = options;
					const isPreview = options.includes("preview");
					const file = options.find((option) =>
						option.endsWith("." + extension),
					);

					if (!file && !isPreview)
						return createBlockEntities(block, render.code);

					await mkdir(getTmp(folder), { recursive: true });

					const src = `${folder}/${
						file || `preview-${i}.${extension}`
					}`;

					const tmp = getTmp(src);

					await write(tmp, block.text);

					if (file) files.add(file);

					sources[tmp] = { files, id, src };

					if (isPreview) {
						return createBlockHtml(`<!--src:${tmp}-->`);
					}
				}

				if (block.type === "code") {
					block = createBlockEntities(block, render.code);
				}

				return render[block.type] ? render[block.type](block) : block;
			}),
		);

		const html = parser(customBlock)
			.replace(
				/<!--src:(.+)-->/,
				(_, id) => `\${(await import("${id}")).default}`,
			)
			.replace(/(\\)?`/g, "\\`");

		return `
		import { html } from 'atomico';
		${inject || ""}
		export default html\`${html}\`;
		`;
	},
});
