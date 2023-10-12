import MagicString from "magic-string";
import { isTestJs } from "./utils.js";

const virtualModule = "virtual:atomico-polyfill-vitest";
const virtualModuleId = "\0" + virtualModule;

/**
 *
 * @returns {import("vite").Plugin}
 */
export const pluginVitest = () => ({
	name: "atomico-plugin-md",
	transform(code, id) {},
	resolveId(id) {
		if (id === virtualModule) {
			return virtualModuleId;
		}
	},
	load(id) {
		if (id === virtualModuleId) {
			return `
            import { beforeEach, afterEach } from "vitest";
            
            window.beforeEach = beforeEach;
            window.afterEach = afterEach;
            `;
		}
	},
});
