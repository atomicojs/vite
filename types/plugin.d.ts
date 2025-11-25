declare function _default({ jsx, cssLiterals, tsconfig: tsconfigSrc, storybook, vitest, customElements, unplugin, runtimeWrappers, markdown, serverActions, }?: {
    jsx?: boolean;
    cssLiterals?: {
        minify?: boolean;
        postcss?: boolean;
    };
    runtimeWrappers?: boolean;
    tsconfig?: string;
    customElements?: {
        prefix?: string;
        wrappers?: Record<string, string[]>;
        define?: string[];
    };
    storybook?: {
        include?: string[];
        fullReload?: boolean;
    };
    vitest?: boolean;
    unplugin?: boolean;
    markdown?: boolean | any;
    serverActions?: boolean | import("./plugins/server-actions.js").OptionsServerActions;
}): import("vite").Plugin[];
export default _default;
