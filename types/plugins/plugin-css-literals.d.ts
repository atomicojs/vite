export function pluginCssLiterals({ include, ...options }?: {
    minify?: boolean;
    postcss?: boolean;
    include: ("js" | "ts" | "jsx" | "tsx")[];
    addFile: (file: string) => void;
}): import("rollup").Plugin;
