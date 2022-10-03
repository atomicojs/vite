export function pluginEsbuild({ tsconfig, include, }?: {
    tsconfig: any;
    loaders: import("esbuild").Loader[];
}): import("rollup").Plugin;
