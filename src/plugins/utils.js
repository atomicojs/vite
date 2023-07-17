import { createRequire } from "module";
import { readFileSync } from "fs";

export const require = createRequire(import.meta.url);

/**
 *
 * @param {string} url
 * @returns {TsConfig}
 */
export const getTsJsonConfig = (url) => {
    let path = "";
    try {
        path = require.resolve(url);
    } catch {
        return {};
    }
    return jsonAutoFix(readFileSync(path, "utf8"));
};

export function jsonAutoFix(content) {
    try {
        const json = JSON.parse(content);
        return json;
    } catch ({ message }) {
        let test = message.match(/position (\d+)/);
        if (test) {
            const position = Number(test.at(1)) - 1;
            if (content[position] === "," || /\s+/.test(content[position])) {
                return jsonAutoFix(
                    content.slice(0, position) + content.slice(position + 1)
                );
            }
        }
        throw message;
    }
}

/**
 * @typedef { {extends?:string, include?:string[],compilerOptions:TsConfigCompilerOptions} } TsConfig
 */

/**
 * @typedef {{jsxImportSource?:string,jsx?:string}} TsConfigCompilerOptions
 */

/**
 * @type {{[id:string]:TsConfig}}
 */
const cache = {};
/**
 *
 * @param {string} url
 * @returns
 */
export const getTsConfig = (url) => {
    if (cache[url]) return cache[url];
    try {
        /**
         * @type {TsConfig}
         */
        let currentConfig = {};

        /**
         * @type {TsConfig}
         */
        let {
            extends: extendsFile,
            include,
            compilerOptions,
        } = getTsJsonConfig(url) || {};
        if (extendsFile) {
            if (extendsFile.startsWith(".")) {
                extendsFile = new URL(extendsFile, url).href;
            }
            currentConfig = {
                ...getTsConfig(extendsFile),
            };
        }

        currentConfig = {
            ...currentConfig,
            include,
            compilerOptions: {
                ...currentConfig.compilerOptions,
                ...compilerOptions,
            },
        };

        return (cache[url] = currentConfig);
    } catch {
        // throw new Error(
        //     `@atomico/vite requires a tsconfig to work, if you don't have one you can install @atomico/tsconfig and extend it into a local tsconfig.json file.\n    File not Found: ${url}`
        // );
    }
};

/**
 * @param {string} id
 * @returns {string|undefined}
 */
export const getExtension = (id) =>
    (id.match(/\.(\w+)(\?.+){0,1}$/) || []).at(1);

export const isJs = (id) => /\.(tsx|jsx|js|mjs|ts)(\?.+){0,1}$/.test(id);

export const isJsx = (id) => /\.(tsx|jsx(\?.+){0,1})$/.test(id);

export const isTestJs = (id) => /\.(test|spec)\.(tsx|jsx|js|mjs|ts)$/.test(id);

/**
 *
 * @param {string} path
 * @returns
 */
export const pathToRegExp = (path) =>
    RegExp(
        path
            .replace(/\.$/g, "\\.")
            .replace(/\/\*$/, "/[^/]+")
            .replace(/\*\*\//g, "([^\\/]+/){0,}") + "$"
    );
/***
 * @param {string} id
 * @param {string[]} include
 */
export const tsMatch = (id, include) => {
    const exclude = include.filter((path) => path.startsWith("!"));
    if (exclude.some((path) => pathToRegExp(path.slice(1)).test(id))) {
        return false;
    }
    return include.map(pathToRegExp).some((reg) => reg.test(id));
};
