import templateLiterals from "@uppercod/template-literals";
import { transform } from "esbuild";
import postcss from "postcss";
import postcssLoadConfig from "postcss-load-config";
import postcssImported from "@atomico/postcss-imported";
import MagicString from "magic-string";
import { getExtension, isJs } from "./utils.js";
import { fileURLToPath } from "url";
/**
 * @type {Promise<import("postcss-load-config").Result>}
 */
let task;
/**
 *
 * @param {object} options
 * @param {boolean} [options.minify]
 * @param {boolean} [options.postcss]
 * @param {("js"|"ts"|"jsx"|"tsx")[]} options.include
 * @param {(file:string)=>void} options.addFile
 * @return {import("rollup").Plugin}
 */
export const pluginCssLiterals = ({
    include = ["js", "ts", "jsx", "tsx"],
    ...options
} = {}) => ({
    name: "atomico-plugin-css-literals",
    async transform(code, id) {
        if (!isJs(id)) return;
        const loader = getExtension(id);

        if (!include.includes(loader)) return;

        if (!task) task = postcssLoadConfig().catch(() => undefined);

        const postcssConfig = await task;

        const source = new MagicString(code);

        const report = {};

        await Promise.all(
            templateLiterals(code)
                .filter(({ type, params }) => type === "css" && !params.length)
                .map(async ({ start, end }) => {
                    let css = code.slice(start, end);
                    if (!css.trim()) return;

                    if (options.postcss && postcssConfig) {
                        const { plugins } = postcssConfig;

                        await postcss([
                            postcssImported({
                                report,
                                atrule: "tokens",
                            }),
                            postcssImported({
                                report,
                                plugins: [
                                    postcssImported({
                                        report,
                                        atrule: "tokens",
                                    }),
                                ],
                            }),
                        ]).process(css, {
                            from: id,
                        });

                        const result = await postcss(plugins).process(css, {
                            from: id,
                        });

                        css = result.css;
                    }

                    if (options.minify) {
                        const result = await transform(css, {
                            loader: "css",
                            minify: true,
                        });

                        css = result.code;
                    }

                    if (css === code) return;

                    source.overwrite(
                        start,
                        end,
                        css.trim().replace(/`/g, "\\`")
                    );
                })
        );

        for (let file in report) {
            const src = fileURLToPath(file);
            if (options.addFile) options.addFile(src);
            this.addWatchFile(src);
        }

        return {
            code: source.toString(),
            map: source.generateDecodedMap(),
        };
    },
});
