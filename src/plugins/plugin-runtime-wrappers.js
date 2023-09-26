import * as acornWalk from "acorn-walk";
import { parse } from "path";
import { isJs } from "./utils.js";
/**
 * @return {import("rollup").Plugin}
 */
export const pluginRuntimeWrappers = () => ({
	name: "atomico-plugin-custom-element",
	async transform(code, id) {
		if (!isJs(id)) return;
		if (!id.endsWith("?react")) return;

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
			const list = [...customElements];
			const base = parse(id).base.replace(/\?(.+)/, "");

			const code = [
				`import { auto } from "@atomico/react";`,
				`import { ${list.map(
					(name) => `${name} as _${name}`,
				)} } from "./${base}";`,
				list.map((name) => [
					"",
					`export const ${name} = auto(_${name});`,
					`${name}.name = "${name}";`,
				]),
			]
				.flat(10)
				.join("\n");

			return {
				code,
				map: "",
			};
		}
	},
});
