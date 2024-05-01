import { pluginCssLiterals } from "./plugins/css-literals.js";
import { pluginCustomElement } from "./plugins/custom-element.js";
import { pluginEsbuild } from "./plugins/esbuild.js";
import { pluginLibrary } from "./plugins/library.js";
import { pluginRuntimeWrappers } from "./plugins/runtime-wrappers.js";
import { pluginStorybook } from "./plugins/storybook.js";
import { pluginVitest } from "./plugins/vitest.js";
import { pluginMarkdown } from "./plugins/markdown.js";
import { pluginServerActions } from "./plugins/server-actions.js";
import { getTsConfig } from "./plugins/utils.js";
/**
 *
 * @param {object} options
 * @param {boolean} [options.jsx]
 * @param {object} [options.cssLiterals]
 * @param {boolean} [options.cssLiterals.minify]
 * @param {boolean} [options.cssLiterals.postcss]
 * @param {boolean} [options.runtimeWrappers]
 * @param {string} [options.tsconfig]
 * @param {object} [options.customElements]
 * @param {string} [options.customElements.prefix]
 * @param {Record<string,string[]>} [options.customElements.wrappers]
 * @param {string[]} [options.customElements.define]
 * @param {{include?:string[],fullReload ?: boolean}} [options.storybook]
 * @param {boolean} [options.vitest]
 * @param {boolean} [options.unplugin]
 * @param {boolean|import("./plugins/markdown.js").OptionMd} [options.markdown]
 * @param {boolean|import("./plugins/server-actions.js").OptionsServerActions} [options.serverActions]
 * @returns {import("vite").Plugin[]}
 */
export default ({
	jsx = true,
	cssLiterals = {
		minify: false,
		postcss: false,
	},
	tsconfig: tsconfigSrc = "tsconfig.json",
	storybook,
	vitest,
	customElements,
	unplugin,
	runtimeWrappers,
	markdown,
	serverActions,
} = {}) => {
	let tsconfig = getTsConfig(process.cwd() + "/" + tsconfigSrc);

	const files = {};

	/**
	 * @type {import("vite").FSWatcher}
	 */
	let watcher;

	/**
	 * @type {import("vite").Plugin[]}
	 */
	const plugins = unplugin
		? []
		: [
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

						watcher.on(
							"change",
							(file) =>
								(files[file] || storybook?.fullReload) &&
								reload(file),
						);
					},
					config(config, { command }) {
						if (jsx && tsconfig?.compilerOptions?.jsxImportSource) {
							return {
								esbuild: {
									jsx: "automatic",
									jsxImportSource:
										tsconfig.compilerOptions
											.jsxImportSource,
								},
								...(command === "serve"
									? {
											optimizeDeps: {
												exclude: [
													"atomico/jsx-runtime",
												],
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
			}),
		);

	if (jsx) {
		plugins.push(pluginEsbuild({ tsconfig }));
	}

	if (process.env.VITEST && vitest !== false) plugins.push(pluginVitest());

	if (global.ATOMICO_VITE_CLI) {
		plugins.unshift(pluginLibrary(global.ATOMICO_VITE_CLI));
	}

	if (customElements) {
		plugins.push(pluginCustomElement(customElements));
	}

	if (storybook?.include) {
		plugins.unshift(pluginStorybook(storybook?.include));
		plugins.push(
			pluginCustomElement({
				define: ["**/*"],
				onlyExport: true,
			}),
		);
	}

	if (runtimeWrappers) {
		plugins.unshift(pluginRuntimeWrappers());
	}

	if (markdown) {
		plugins.push(pluginMarkdown(markdown === true ? {} : markdown));
	}

	if (serverActions) {
		plugins.push(
			pluginServerActions(markdown === true ? {} : serverActions),
		);
	}

	return plugins;
};
