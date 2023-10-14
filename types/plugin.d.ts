declare function _default({ jsx, cssLiterals, tsconfig: tsconfigSrc, storybook, vitest, customElements, unplugin, runtimeWrappers, markdown, }?: {
    jsx?: boolean;
    cssLiterals?: {
        minify?: boolean;
        postcss?: boolean;
    };
    runtimeWrappers?: boolean;
    tsconfig?: string;
    customElements?: {
        prefix?: string;
        define?: string[];
    };
    storybook?: {
        include?: string[];
        fullReload?: boolean;
    };
    vitest?: boolean;
    unplugin?: boolean;
    markdown?: boolean | import("./plugins/plugin-md.js").OptionMd;
}): import("vite").Plugin[];
export default _default;
