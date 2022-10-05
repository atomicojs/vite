declare function _default({ jsx, cssLiterals, tsconfigSrc, storybook, }?: {
    jsx?: boolean;
    cssLiterals?: {
        minify?: boolean;
        postcss?: boolean;
    };
    tsconfigSrc?: string;
    storybook?: string[];
}): import("vite").Plugin[];
export default _default;
