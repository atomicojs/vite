declare function _default({ jsx, cssLiterals, tsconfig: tsconfigSrc, storybook, vitest, customElements, unplugin, runtimeWrappers, }?: {
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
    storybook?: string[];
    vitest?: boolean;
    unplugin?: boolean;
}): import("vite").Plugin[];
export default _default;
