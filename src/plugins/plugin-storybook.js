import MagicString from "magic-string";
import * as acornWalk from "acorn-walk";
import { isJsx, tsMatch } from "./utils.js";

const reactId = "react/jsx-";

/**
 * @param {string[]} expression
 * @returns {import("rollup").Plugin}
 */
export function pluginStorybook(expression) {
    return {
        name: "atomico-plugin-storybook",
        transform(code, id) {
            if (!isJsx(id)) return;
            if (!tsMatch(id, expression)) return;
            /**
             * @type {{[index:string]:{start:number,end:number,raw:string}}}
             */
            let imports = {};

            acornWalk.ancestor(this.parse(code), {
                ImportDeclaration(node) {
                    imports[node.source.value] =
                        imports[node.source.value] || [];

                    imports[node.source.value].push({
                        start: node.start,
                        end: node.end,
                        raw: node.source.raw,
                    });
                },
            });

            const entries = Object.entries(imports).filter(([name]) =>
                name.startsWith(reactId),
            );

            if (entries.length) {
                const source = new MagicString(code);

                entries.forEach(([, imports]) =>
                    imports.forEach(({ start, end }) => {
                        const value = code
                            .slice(start, end)
                            .replace(
                                /react\/jsx(-dev){0,1}-runtime/,
                                "atomico/jsx-runtime",
                            );

                        source.overwrite(start, end, value);
                    }),
                );

                return {
                    code: source.toString(),
                    map: source.generateDecodedMap(),
                };
            }
        },
    };
}
