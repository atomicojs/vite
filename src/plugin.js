import {
  pipeline,
  jsxRuntime,
  cssLiterals as _cssLiterals,
} from "@atomico/pipeline";
import { fileURLToPath } from "url";

const virtualPolyfillVitest = " atomico-polyfill-vitest";
/**
 *
 * @returns {import("vite").Plugin}
 */
export default ({
  jsx = true,
  cssLiterals = {
    minify: false,
    postcss: false,
  },
} = {}) => {
  let environment;
  /**
   * @type {Object<string,boolean>}
   */
  const files = {};

  /**
   * @type {import("vite").FSWatcher}
   */
  let watcher;

  return {
    name: "@atomico/plugin-vite",
    config(opts) {
      environment = opts?.test?.environment;

      const include = opts?.optimizeDeps?.include || [];
      const exclude = opts?.optimizeDeps?.exclude || [];

      if (jsx && !include.includes("atomico/jsx-runtime"))
        include.push("atomico/jsx-runtime");

      return {
        ...opts,
        optimizeDeps: {
          include,
          exclude,
        },
        esbuild: {
          ...opts.esbuild,
          jsxFactory: "_jsx",
          jsxFragment: `"host"`,
        },
      };
    },
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
    async transform(code, id) {
      const isJs = /\.(tsx|jsx|js|mjs|ts)$/.test(id);
      const isJSX = /\.(tsx|jsx)$/.test(id);
      const isTest =
        environment === "happy-dom" &&
        /\.(test|spec)\.(tsx|jsx|js|mjs|ts)$/.test(id);

      const withCssLiterals = isJs && code.includes("css`");

      if (isJSX || isTest || withCssLiterals) {
        const plugins = [];
        const report = {};

        if (jsx && isJSX) {
          plugins.push(jsxRuntime());
        }

        if (withCssLiterals && cssLiterals) {
          plugins.push(_cssLiterals({ ...cssLiterals, report }));
        }

        const { source: magicString } = await pipeline(
          { code, path: id },
          ...plugins
        );

        if (isTest && process.env.VITEST) {
          magicString.prepend(`import "${virtualPolyfillVitest}";`);
        }

        if (watcher) {
          Object.keys(report).forEach((file) => {
            const src = fileURLToPath(file);
            if (!files[src]) {
              watcher.add(src);
              files[src] = true;
            }
            this.addWatchFile(src);
          });
        }

        return {
          map: magicString.generateMap({ hires: true }),
          code: magicString.toString(),
        };
      }
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
  };
};
