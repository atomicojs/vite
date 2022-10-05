const virtual = ` atomico-vite-virtual`;
/**
 * @return {import("rollup").Plugin}
 */
export function pluginLib(files) {
    return {
        resolveId(id) {
            if (id === virtual) return { id };
        },
        load(id) {
            if (id === virtual) {
                return `
                    ${files
                        .map(([, file]) => `import("./${file}");`)
                        .join(";\n")}
                `;
            }
        },
        buildStart() {
            this.emitFile({
                type: "chunk",
                id: virtual,
                fileName: virtual,
            });
        },
        generateBundle(options, bundle) {
            delete bundle[virtual];
        },
    };
}
