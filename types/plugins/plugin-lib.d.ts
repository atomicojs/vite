/**
 * @param {{tmp:string}} options
 * @return {import("vite").Plugin}
 */
export function pluginLib({ tmp }: {
    tmp: string;
}): import("vite").Plugin;
