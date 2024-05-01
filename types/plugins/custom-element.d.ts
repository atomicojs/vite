export function pluginCustomElement(options: {
    prefix: string;
    define: string[];
    wrappers: Record<string, string[]>;
    onlyExport: boolean;
}): import("vite").Plugin;
