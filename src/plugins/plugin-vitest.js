import MagicString from "magic-string";
import { isTestJs } from "./utils.js";

const virtualPolyfillVitest = " atomico-polyfill-vitest";
/**
 *
 * @returns {import("rollup").Plugin}
 */
export const pluginVitest = () => ({
    name: "atomico-plugin-vitest",
    transform(code, id) {
        if (!isTestJs(id)) return;

        const source = new MagicString(code);

        source.prepend(`import "${virtualPolyfillVitest}";`);

        return {
            code: source.toString(),
            map: source.generateDecodedMap(),
        };
    },
    load(id) {
        if (id === virtualPolyfillVitest) {
            return `
            import { beforeEach, afterEach } from "vitest";
            
            window.beforeEach = beforeEach;
            window.afterEach = afterEach;
            `;
        }
    },
});
