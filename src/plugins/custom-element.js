import MagicString from "magic-string";
import * as acornWalk from "acorn-walk";
import { tsMatch, isJs } from "./utils.js";

const AtomicoWrappers = {
	atomico: ["c", "createContext"],
	"@atomico/store": ["createStore"],
};

/**
 * @param {object} options
 * @param {string} options.prefix
 * @param {string[]} options.define
 * @param {Record<string,string[]>} options.wrappers
 * @param {boolean} options.onlyExport
 * @return {import("vite").Plugin}
 */
export const pluginCustomElement = (options) => ({
	name: "atomico-plugin-custom-element",
	async transform(code, id) {
		if (!isJs(id)) return;
		if (!tsMatch(id, options.define)) return;

		const ast = this.parse(code);

		const customElements = new Set();

		const wrappers = {
			...options.wrappers,
			...AtomicoWrappers,
		};

		const wrappersVariableDeclaration = new Set();

		acornWalk.ancestor(ast, {
			ImportDeclaration(node) {
				if (wrappers[node?.source?.value]) {
					const { imported } =
						node.specifiers.find(({ imported }) =>
							wrappers[node?.source?.value].includes(
								imported.name,
							),
						) || {};
					if (imported)
						wrappersVariableDeclaration.add(imported.name);
				}
			},
			ExportNamedDeclaration(node) {
				if (!wrappersVariableDeclaration.size || !node.declaration)
					return;

				const { type } = node.declaration;

				if (
					type === "VariableDeclaration" &&
					wrappersVariableDeclaration.has(
						node?.declaration?.declarations?.[0]?.init?.callee
							?.name,
					)
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
