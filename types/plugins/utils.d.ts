export const require: NodeRequire;
export function getTsConfig(url: string): TsConfig;
export function getExtension(id: string): string | undefined;
export function isJs(id: any): boolean;
export function isJsx(id: any): boolean;
export function isTestJs(id: any): boolean;
export function tsMatch(id: string, include: string[]): boolean;
export type TsConfig = {
    extends?: string;
    include?: string[];
    compilerOptions: TsConfigCompilerOptions;
};
export type TsConfigCompilerOptions = {
    jsxImportSource?: string;
    jsx?: string;
};
