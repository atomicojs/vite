import { normalize } from "path";
/**
 * @param {{tmp:string}} options
 * @return {import("vite").Plugin}
 */
export function pluginLibrary({ tmp }) {
	return {
		name: "atomico-plugin-lib",
		generateBundle(options, bundle) {
			for (let prop in bundle) {
				if (
					normalize(bundle[prop].facadeModuleId || "") ===
					normalize(tmp)
				) {
					delete bundle[prop];
				}
			}
		},
	};
}
