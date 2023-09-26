import MagicString from "magic-string";
import * as acornWalk from "acorn-walk";
import { tsMatch, isJs } from "./utils.js";
/**
 * @param {object} options
 * @param {string} options.prefix
 * @param {string[]} options.define
 * @param {boolean} options.onlyExport
 * @return {import("rollup").Plugin}
 */
export const pluginCustomElement = (options) => ({
	name: "atomico-plugin-custom-element",
	async transform(code, id) {
		if (!isJs(id)) return;
		if (!tsMatch(id, options.define)) return;

		const ast = this.parse(code);

		const customElements = new Set();

		let isAtomico;

		acornWalk.ancestor(ast, {
			ImportDeclaration(node) {
				if (
					node?.source?.value === "atomico" &&
					node.specifiers.some(
						({ imported }) => imported.name === "c",
					)
				) {
					isAtomico = true;
				}
			},
			ExportNamedDeclaration(node) {
				if (!isAtomico || !node.declaration) return;

				const { type } = node.declaration;

				if (
					type === "VariableDeclaration" &&
					node?.declaration?.declarations?.[0]?.init?.callee?.name ===
						"c"
				) {
					customElements.add(
						node?.declaration?.declarations?.[0]?.id?.name,
					);
				}
			},
		});

		if (customElements.size) {
			const source = new MagicString(code);
			const { prefix = "" } = options;

			const declarations = [...customElements].map((name) =>
				options.onlyExport
					? `${name}.export = "${name}";`
					: `customElements.define("${tagName(
							prefix + name,
					  )}", ${name});`,
			);

			source.append(declarations.join("\n"));

			return {
				code: source.toString(),
				map: source.generateDecodedMap(),
			};
		}
	},
});

const tagName = (name) =>
	name
		.replace(
			/([a-zA-Z])([A-Z]+)/g,
			(all, before, after) => `${before}-${after}`,
		)
		.toLowerCase();
