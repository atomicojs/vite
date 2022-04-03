import MagicString from "magic-string";

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
    if (/\.(tsx|jsx)$/.test(id)) {
      const magicString = new MagicString(code);
      magicString.prepend(
        `import { ${jsxPragma} as ${jsxFactory} } from "${jsxImportSource}";\n`
      );
      return {
        map: magicString.generateMap({ hires: true }),
        code: magicString.toString(),
      };
    }
  },
});
