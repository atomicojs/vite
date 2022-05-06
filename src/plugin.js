import {
  pipeline,
  jsxRuntime,
  cssLiterals as _cssLiterals,
} from "@atomico/pipeline";

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

  return {
    name: "@atomico/plugin-vite",
    config(opts) {
      environment = opts?.test?.environment;

      const include = opts?.optimizeDeps?.include || [];
      const exclude = opts?.optimizeDeps?.exclude || [];

      if (!include.includes("atomico")) include.push("atomico");
      if (!include.includes("atomico/jsx-runtime"))
        include.push("atomico/jsx-runtime");

      if (!exclude.includes("atomico/ssr")) exclude.push("atomico/ssr");

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
    async transform(code, id) {
      const isJs = /\.(tsx|jsx|js|mjs|ts)$/.test(id);
      const isJSX = /\.(tsx|jsx)$/.test(id);
      const isTest =
        environment === "happy-dom" &&
        /\.(test|spec)\.(tsx|jsx|js|mjs|ts)$/.test(id);

      const withCssLiterals = isJs && code.includes("css`");

      if (isJSX || isTest || withCssLiterals) {
        const plugins = [];

        if (jsx && isJSX) {
          plugins.push(jsxRuntime());
        }

        if (withCssLiterals && cssLiterals) {
          plugins.push(_cssLiterals(cssLiterals));
        }

        const { source: magicString } = await pipeline(
          { code, path: id },
          ...plugins
        );

        if (isTest && process.env.VITEST) {
          magicString.prepend(`import "${virtualPolyfillVitest}";`);
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
