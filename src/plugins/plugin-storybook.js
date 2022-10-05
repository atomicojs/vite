import MagicString from "magic-string";
import * as acornWalk from "acorn-walk";
import { isJsx } from "./utils.js";

const reactId = "\x00react/jsx-dev-runtime";
/**
 * @returns {import("rollup").Plugin}
 */
export function pluginStorybook() {
    return {
        resolveId(id) {
            if (id === reactId) {
                return { id };
            }
        },
        transform(code, id) {
            if (!isJsx(id)) return;
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

            if (
                imports[reactId] &&
                Object.keys(imports).some(
                    (name) => name === "atomico" || name.startsWith("atomico/")
                )
            ) {
                const source = new MagicString(code);

                source.overwrite(
                    imports[reactId].start,
                    imports[reactId].end,
                    `"atomico/jsx-runtime"`
                );

                return {
                    code: source.toString(),
                    map: source.generateDecodedMap(),
                };
            }
        },
    };
}
