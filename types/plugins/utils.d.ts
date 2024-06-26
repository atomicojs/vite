export function jsonAutoFix(content: any): any;
export function copy(src: any, dest: any): Promise<void>;
export function md5(value: string): string;
export const require: NodeRequire;
export function getTsJsonConfig(url: string): TsConfig;
export function getTsConfig(url: string): TsConfig;
export function getExtension(id: string): string | undefined;
export function isJs(id: any): boolean;
export function isJsx(id: any): boolean;
export function isTestJs(id: any): boolean;
export function pathToRegExp(path: string): RegExp;
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
