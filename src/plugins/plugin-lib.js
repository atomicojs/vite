import { normalize } from "path";
// const virtual = ` atomico-vite-virtual`;
/**
 * @param {{tmp:string}} options
 * @return {import("vite").Plugin}
 */
export function pluginLib({ tmp }) {
	return {
		name: "atomico-plugin-lib",
		// resolveId(id) {
		//     if (id === virtual) return { id };
		// },
		// load(id) {
		//     if (id === virtual) {
		//         return `
		//             ${files
		//                 .map(([, file]) => `import("./${file}");`)
		//                 .join(";\n")}
		//         `;
		//     }
		// },
		// buildStart() {
		//     this.emitFile({
		//         type: "chunk",
		//         id: virtual,
		//         fileName: virtual,
		//     });
		// },
		generateBundle(options, bundle) {
			for (let prop in bundle) {
				if (
					normalize(bundle[prop].facadeModuleId || "") ===
					normalize(tmp)
				) {
					delete bundle[prop];
				}
			}
			// delete bundle[virtual];
		},
	};
}
