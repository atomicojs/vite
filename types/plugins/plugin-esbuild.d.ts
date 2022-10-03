export function pluginEsbuild({ tsconfig, include, }?: {
    tsconfig: {
        compilerOptions: {
            jsxImportSource: string;
        };
    };
    include: string[];
    loaders: import("esbuild").Loader[];
}): import("rollup").Plugin;
