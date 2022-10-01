import { transform as transformEsbuild } from "esbuild";
import { getExtension, isJsx } from "./utils.js";

const cwd = process.cwd();
/**
 * @param {object} options
 * @param {any} options.tsconfig
 * @param {import("esbuild").Loader[]} options.loaders
 * @return {import("rollup").Plugin}
 */
export const pluginEsbuild = ({
    tsconfig = {
        compilerOptions: { jsxImportSource: "atomico" },
    },
    include = ["ts", "jsx", "tsx"],
} = {}) => ({
    name: "atomico-plugin-esbuild",
    async transform(code, id) {
        if (!isJsx(id)) return;

        const loader = getExtension(id);

        if (!include.includes(loader)) return;

        const { compilerOptions } = tsconfig;

        const result = await transformEsbuild(code, {
            jsx: "automatic",
            jsxImportSource: compilerOptions.jsxImportSource,
            loader,
            sourcemap: true,
        });

        return result;
    },
});
