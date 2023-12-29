import MagicString from "magic-string";
import { isTestJs } from "./utils.js";
import { getTemplateContent } from "../utils.js";

const VIRTUAL_MODULE = "virtual:atomico-polyfill-vitest";
const VIRTUAL_MODULE_ID = "\0" + VIRTUAL_MODULE;

/**
 *
 * @returns {import("vite").Plugin}
 */
export const pluginVitest = () => ({
	name: "atomico-plugin-vitest",
	transform(code, id) {
		if (!isTestJs(id)) return;

		const source = new MagicString(code);

		source.prepend(`import "${VIRTUAL_MODULE}";`);

		return {
			code: source.toString(),
			map: source.generateDecodedMap(),
		};
	},
	resolveId(id) {
		if (id === VIRTUAL_MODULE) {
			return VIRTUAL_MODULE_ID;
		}
	},
	load(id) {
		if (id === VIRTUAL_MODULE_ID) {
			return getTemplateContent("vm-vitest.js");
		}
	},
});
