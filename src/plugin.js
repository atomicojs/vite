import MagicString from "magic-string";

const virtualPolyfillVitest = " atomico-polyfill-vitest";
/**
 *
 * @returns {import("vite").Plugin}
 */
export default ({
  jsxImportSource = "atomico/jsx-runtime",
  jsxPragma = "jsx",
  jsxFactory = "_jsx",
} = {}) => ({
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
  transform(code, id) {
    const isJSX = /\.(tsx|jsx)$/.test(id);
    const isTest = /\.(test|spec)\.(tsx|jsx|js|mjs|ts)$/.test(id);
    if (isJSX || isTest) {
      const magicString = new MagicString(code);
      if (isJSX) {
        magicString.prepend(
          `import { ${jsxPragma} as ${jsxFactory} } from "${jsxImportSource}";`
        );
      }
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
});
