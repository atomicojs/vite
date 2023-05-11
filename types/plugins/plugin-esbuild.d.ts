export function pluginEsbuild({ tsconfig, }?: {
    tsconfig: {
        compilerOptions: {
            jsxImportSource: string;
        };
    };
    include: ("js" | "ts" | "jsx" | "tsx")[];
    loaders: import("esbuild").Loader[];
}): import("rollup").Plugin;
