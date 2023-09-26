export function pluginCustomElement(options: {
	prefix: string;
	define: string[];
	onlyExport: boolean;
}): import("rollup").Plugin;
