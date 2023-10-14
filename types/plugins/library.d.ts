/**
 * @param {{tmp:string}} options
 * @return {import("vite").Plugin}
 */
export function pluginLibrary({ tmp }: {
    tmp: string;
}): import("vite").Plugin;
