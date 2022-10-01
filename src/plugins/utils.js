import { createRequire } from "module";

export const require = createRequire(import.meta.url);

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
    /**
     * @type {TsConfig}
     */
    let currentConfig = {};

    /**
     * @type {TsConfig}
     */
    let { extends: extendsFile, include, compilerOptions } = require(url) || {};

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
};

/**
 * @param {string} id
 * @returns {string|undefined}
 */
export const getExtension = (id) => (id.match(/\.(\w+)$/) || []).at(1);

export const isJs = (id) => /\.(tsx|jsx|js|mjs|ts)$/.test(id);

export const isJsx = (id) => /\.(tsx|jsx)$/.test(id);

export const isTestJs = (id) => /\.(test|spec)\.(tsx|jsx|js|mjs|ts)$/.test(id);
