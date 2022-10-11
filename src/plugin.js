import { pluginCssLiterals } from "./plugins/plugin-css-literals.js";
import { pluginEsbuild } from "./plugins/plugin-esbuild.js";
import { pluginVitest } from "./plugins/plugin-vitest.js";
import { pluginLib } from "./plugins/plugin-lib.js";
import { pluginStorybook } from "./plugins/plugin-storybook.js";
import { getTsConfig } from "./plugins/utils.js";
/**
 *
 * @param {object} options
 * @param {boolean} [options.jsx]
 * @param {{minify?:boolean,postcss?:boolean}} [options.cssLiterals]
 * @param {string} [options.tsconfigSrc]
 * @param {string[]} [options.storybook]
 * @param {boolean} [options.vitest]
 * @returns {import("vite").Plugin[]}
 */
export default ({
    jsx = true,
    cssLiterals = {
        minify: false,
        postcss: false,
    },
    tsconfigSrc = process.cwd() + "/tsconfig.json",
    storybook,
    vitest,
} = {}) => {
    const tsconfig = getTsConfig(tsconfigSrc);

    const files = {};

    /**
     * @type {import("vite").FSWatcher}
     */
    let watcher;

    /**
     * @type {import("vite").Plugin[]}
     */
    const plugins = [
        {
            name: "atomico-plugin",
            configureServer(server) {
                watcher = server.watcher;
                /**
                 * @param {string} path
                 */
                const reload = (path) => {
                    server.ws.send({
                        type: "full-reload",
                        path,
                    });
                };

                watcher.on("change", (file) => files[file] && reload(file));
            },
            config(config, { command }) {
                if (jsx && tsconfig?.compilerOptions?.jsxImportSource) {
                    return {
                        esbuild: {
                            jsx: "automatic",
                            jsxImportSource:
                                tsconfig.compilerOptions.jsxImportSource,
                        },
                        ...(command === "serve"
                            ? {
                                  optimizeDeps: {
                                      exclude: ["atomico/jsx-runtime"],
                                  },
                              }
                            : {}),
                    };
                }
            },
        },
    ];

    if (cssLiterals)
        plugins.push(
            pluginCssLiterals({
                ...cssLiterals,
                addFile(src) {
                    files[src] = true;
                    if (watcher) watcher.add(src);
                },
            })
        );

    if (jsx) {
        plugins.push(pluginEsbuild({ tsconfig }));
    }

    if (process.env.VITEST && vitest !== false) plugins.push(pluginVitest());

    if (global.ATOMICO_VITE_CLI) {
        plugins.unshift(pluginLib(global.ATOMICO_VITE_CLI));
    }

    if (storybook) {
        plugins.unshift(pluginStorybook(storybook));
    }

    return plugins;
};
