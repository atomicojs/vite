import MagicString from "magic-string";
import templateLiterals from "@uppercod/template-literals";
import { transformSync } from "esbuild";
import postcss from "postcss";
import postcssLoadConfig from "postcss-load-config";

const virtualPolyfillVitest = " atomico-polyfill-vitest";
/**
 *
 * @returns {import("vite").Plugin}
 */
export default ({
  jsxImportSource = "atomico/jsx-runtime",
  jsxPragma = "jsx",
  jsxFactory = "_jsx",
  cssLiterals = {
    minify: false,
    postcss: false,
  },
} = {}) => {
  let currentConfigPostCss =
    cssLiterals.postcss && postcssLoadConfig({ parser: true });

  return {
    name: "@atomico/plugin-vite",
    config(opts) {
      return {
        ...opts,
        esbuild: {
          ...opts.esbuild,
          jsxFactory: jsxFactory,
          jsxFragment: `"host"`,
        },
      };
    },
    async transform(code, id) {
      const isJs = /\.(tsx|jsx|js|mjs|ts)$/.test(id);
      const isJSX = /\.(tsx|jsx)$/.test(id);
      const isTest = /\.(test|spec)\.(tsx|jsx|js|mjs|ts)$/.test(id);
      const withCssLiterals = isJSX && code.includes("css`");

      if (isJSX || isTest || withCssLiterals) {
        const magicString = new MagicString(code);

        if (isJSX) {
          magicString.prepend(
            `import { ${jsxPragma} as ${jsxFactory} } from "${jsxImportSource}";`
          );
        }

        if (isTest && process.env.VITEST) {
          magicString.prepend(`import "${virtualPolyfillVitest}";`);
        }

        if (
          (cssLiterals.minify || cssLiterals.postcss) &&
          !isTest &&
          withCssLiterals
        ) {
          await Promise.all(
            templateLiterals(code)
              .filter(({ type, params }) => type === "css" && !params.length)
              .map(async ({ start, end }) => {
                let css = code.slice(start, end);

                if (cssLiterals.postcss) {
                  css = (await currentConfigPostCss).then(
                    ({ plugins, options }) =>
                      postcss(plugins)
                        .process(css, options)
                        .then((result) => result.css)
                  );
                }

                if (cssLiterals.minify) {
                  css = transformSync(css, {
                    loader: "css",
                    minify: true,
                  }).code;
                }

                if (css === code) return;

                magicString.overwrite(start, end, css);
              })
          );
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
