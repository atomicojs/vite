declare function _default({ jsx, cssLiterals, tsconfigSrc, }?: {
    jsx?: boolean;
    cssLiterals?: {
        minify: boolean;
        postcss: boolean;
    };
    tsconfigSrc?: string;
}): import("vite").Plugin[];
export default _default;
