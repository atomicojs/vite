import * as acornWalk from "acorn-walk";
import { transform as transformEsbuild } from "esbuild";
import yaml from "js-yaml";
import MagicString from "magic-string";
import { lexer, parser, use } from "marked";
import { markedXhtml } from "marked-xhtml";
import { join } from "path";
import { getTmp, write } from "../tmp.js";
import { md5 } from "./utils.js";

const ID = `preview:${md5(Math.random().toString())}:`;
const ID_REGEXP = RegExp(
	`(\\$)?([\\w\\-]+\=){0,1}\\"${ID}([^\\"|\\']+)\\"`,
	"g",
);

use(markedXhtml());

/**
 * @typedef {{imports: boolean,render:{[type:string]:(token:import("marked").Token & {preview?: string, options?:string[]})=>import("marked").Token}}} OptionMd

/**
 * @type {{[source:string]: { files: {[file:string]: string}, id: string, src: string, preview: boolean}}}
 */
const SOURCES = {};

const FRONTMATTER = "---";

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
				}" />{\`${block.text.replace(/(\\)?`/g, "\\`")}\`}</pre>`,
		  );

/**
 * @param {OptionMd} option
 * @returns {import("vite").Plugin}
 */
export const pluginMarkdown = ({ render = {}, imports = "" } = {}) => ({
	name: "atomico-plugin-md",
	resolveId(file, imported) {
		const source = SOURCES[imported];
		if (source) {
			const regExp = fileToRegExp(file);
			for (const prop in source.files) {
				if (regExp.test(prop)) return source.files[prop];
			}
		}
	},
	async transform(code, id, option) {
		if (id in SOURCES) {
			const source = SOURCES[id];
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

		const [pathname, query] = id.match(/([^\?]+)(?:\?(.+))?/);
		const search = new URLSearchParams(query);

		if (!pathname.endsWith(".md")) return;

		const isMeta = search.has("meta");

		let currentMeta = "";
		let currentModule = imports;

		if (code.startsWith(FRONTMATTER)) {
			let frontmatter = FRONTMATTER;
			let position = frontmatter.length;
			while ((position = ~code.indexOf(FRONTMATTER, position))) {
				const index = ~position;
				if (/\n/.test(code[index - 1])) {
					frontmatter = code.slice(FRONTMATTER.length, index);
					code = code.slice(index + FRONTMATTER.length);
					break;
				}
			}
			if (frontmatter)
				currentMeta = `export const meta = ${JSON.stringify(
					yaml.load(frontmatter),
				)}`;
		}

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

						if (options.includes("module")) {
							currentModule += "\n" + block.text;
							return;
						}

						const isMeta = options.includes("meta");

						const file = isMeta
							? "meta." + extension
							: options.find((option) =>
									option.endsWith("." + extension),
							  );

						if (!file && !isPreview)
							return createCode(block, render.code);

						const src = `${md5(
							idContent + ":" + block.text,
						)}.${extension}`;

						const tmp = getTmp(src);

						await write(tmp, block.text);

						if (file) files[file] = tmp;

						SOURCES[tmp] = { files, id, src, preview: isPreview };

						if (isMeta) {
							currentMeta = `export * from "${tmp}";`;
							return;
						}

						if (isPreview) {
							block.preview = `"${ID}${tmp}"`;
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
		)
			.flat(10)
			.filter((value) => value);

		const content = parser(customBlock).replace(
			ID_REGEXP,
			(_, prefix, attr, id) => {
				return attr
					? `${attr}{()=>import("${id}")}`
					: `{(await import("${id}")).default}`;
			},
		);

		const tmpModuleTemplate = getTmp(idContent + ".tsx");

		SOURCES[tmpModuleTemplate] = { files, id };

		await write(
			tmpModuleTemplate,
			(
				await transformEsbuild(
					`
				${currentModule || ""}
				export default <>${content}</>
				`,
					{
						jsx: "automatic",
						jsxImportSource: "atomico",
						loader: "tsx",
					},
				)
			).code,
		);

		return `
			${currentMeta ? currentMeta : ""}
			${
				isMeta
					? `export default async ()=>(await import("${tmpModuleTemplate}")).default;`
					: `export { default } from "${tmpModuleTemplate}";`
			}
		`;
	},
});
