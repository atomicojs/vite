import { md5 } from "./utils.js";
import * as acornWalk from "acorn-walk";
import MagicString from "magic-string";
import { lexer, parser } from "marked";
import { join } from "path";
import { getTmp, write } from "../tmp.js";

/**
 * @typedef {{inject: boolean,render:{[type:string]:(token:import("marked").Token & {preview?: string, options?:string[]})=>import("marked").Token}}} OptionMd

/**
 * @type {{[source:string]: { files: {[file:string]: string}, id: string, src: string, preview: boolean}}}
 */
const sources = {};

const fileToRegExp = (file) => {
	file = file.split("/").at(-1);
	return RegExp(
		`^${/\.\w+$/.test(file) ? file : file + ".(js|jsx|tsx|ts)"}$`.replace(
			/\./g,
			"\\.",
		),
	);
};

export const createHtml = (raw, text = raw) => ({
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
export const createCode = (block, replace) =>
	replace
		? replace(block)
		: createHtml(
				`<pre><code class="language-${
					block.lang.split(" ").at(0) || "unknown"
				}" textContent="${block.text}"/></pre>`,
		  );

/**
 * @param {OptionMd} option
 * @returns {import("vite").Plugin}
 */
export const pluginMarkdown = ({ render = {}, inject } = {}) => ({
	name: "atomico-plugin-md",
	resolveId(file, imported) {
		const source = sources[imported];
		if (source) {
			const regExp = fileToRegExp(file);
			for (const prop in source.files) {
				if (regExp.test(prop)) return source.files[prop];
			}
		}
	},
	async transform(code, id) {
		if (id in sources) {
			const source = sources[id];
			const replace = [];

			acornWalk.ancestor(this.parse(code), {
				ImportDeclaration(node) {
					const src = node?.source?.value || "";
					const [, file] =
						(src.startsWith(".") && src.match(/\/([^\/]+)$/)) || [];
					if (!file) return;

					if (!src.startsWith(".")) return;

					const regExp = fileToRegExp(file);
					for (const prop in source.files) {
						if (regExp.test(prop)) return source.files[prop];
					}

					const folder = source.id
						.split(/\\|\//)
						.slice(0, -1)
						.join("/");

					replace.push([
						node.source,
						join(folder, src).replaceAll("\\", "/"),
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

		const idContent = md5(code);

		const files = {};

		const customBlock = (
			await Promise.all(
				blocks.map(async (block, i) => {
					if (block.type === "code" && block.lang) {
						const options = block.lang.split(/\s+/);
						const [extension] = options;
						const isPreview = options.includes("preview");
						const file = options.find((option) =>
							option.endsWith("." + extension),
						);

						if (!file && !isPreview)
							return createCode(block, render.code);

						const src = `${idContent}-${md5(
							block.text,
						)}.${extension}`;

						const tmp = getTmp(src);

						await write(tmp, block.text);

						if (file) files[file] = tmp;

						sources[tmp] = { files, id, src, preview: isPreview };

						if (isPreview) {
							block.preview = `<!--preview:${tmp}-->`;
							block.options = options
								.slice(1)
								.filter((value) => value !== "preview");
							return render.preview
								? createCode(block, render.preview)
								: [
										createHtml(block.preview),
										createCode(block, render.code),
								  ];
						}
					}

					if (block.type === "code") {
						block = createCode(block, render.code);
					}

					return render[block.type]
						? render[block.type](block)
						: block;
				}),
			)
		).flat(10);

		const html = parser(customBlock)
			.replace(/([\w\-]+=){0,1}<!--preview:(.+)-->/g, (_, attr, id) => {
				return attr
					? `${attr}\${()=>import("${id}")}`
					: `\${(await import("${id}")).default}`;
			})
			.replace(/(\\)?`/g, "\\`");

		return `
		import { html } from 'atomico';
		${inject || ""}
		export default html\`${html}\`;
		`;
	},
});
