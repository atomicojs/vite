import MagicString from "magic-string";
import * as acornWalk from "acorn-walk";
import micromatch from "micromatch";
import { isJsx } from "./utils.js";

const reactId = "\x00react/jsx-";

/**
 * @param {string[]} expression
 * @returns {import("rollup").Plugin}
 */
export function pluginStorybook(expression) {
    return {
        resolveId(id) {
            if (id.startsWith(reactId)) {
                return { id };
            }
        },
        transform(code, id) {
            if (!isJsx(id) && micromatch([id], expression)) return;
            /**
             * @type {{[index:string]:{start:number,end:number,raw:string}}}
             */
            let imports = {};

            acornWalk.ancestor(this.parse(code), {
                ImportDeclaration(node) {
                    imports[node.source.value] = {
                        start: node.start,
                        end: node.end,
                        raw: node.source.raw,
                    };
                },
            });

            const entries = Object.entries(imports).filter(([name]) =>
                name.startsWith(reactId)
            );

            if (entries.length) {
                const source = new MagicString(code);

                entries.forEach(([, { start, end }]) =>
                    source.overwrite(start, end, `"atomico/jsx-runtime"`)
                );

                return {
                    code: source.toString(),
                    map: source.generateDecodedMap(),
                };
            }
        },
    };
}
