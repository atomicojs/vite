import MagicString from "magic-string";
import * as acornWalk from "acorn-walk";
import { tsMatch } from "./utils.js";
/**
 * @param {object} options
 * @param {string} options.prefix
 * @param {string[]} options.define
 * @return {import("rollup").Plugin}
 */
export const pluginCustomElement = (options) => ({
    async transform(code, id) {
        if (!tsMatch(id, options.define)) return;

        const ast = this.parse(code);

        const customElements = new Set();

        let isAtomico;

        acornWalk.ancestor(ast, {
            ImportDeclaration(node) {
                if (
                    node?.source?.value === "atomico" &&
                    node.specifiers.some(
                        ({ imported }) => imported.name === "c"
                    )
                ) {
                    isAtomico = true;
                }
            },
            ExportNamedDeclaration(node) {
                if (!isAtomico) return;
                const { type } = node.declaration;
                if (
                    type === "VariableDeclaration" &&
                    node?.declaration?.declarations?.[0]?.init?.callee?.name ===
                        "c"
                ) {
                    customElements.add(
                        node?.declaration?.declarations?.[0]?.id?.name
                    );
                }
            },
        });

        if (customElements.size) {
            const source = new MagicString(code);
            const { prefix = "" } = options;

            const declarations = [...customElements].map(
                (name) =>
                    `customElements.define("${tagName(
                        prefix + name
                    )}", ${name});`
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
            (all, before, after) => `${before}-${after}`
        )
        .toLowerCase();