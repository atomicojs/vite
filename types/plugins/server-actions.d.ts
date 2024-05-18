/**
 * @typedef {Object} OptionsServerActions
 * @property {string}  [src]
 * @property {TYPE_VERCEL|TYPE_CLOUDFLARE|TYPE_NETLIFY}  [type]
 * @property {{src:string,href:string}}  [options]
 * @property {string}  [folder]
 */
/**
 * @param {OptionsServerActions} options
 * @returns {import("vite").Plugin}
 */
export function pluginServerActions({ type, folder, src, options, }?: OptionsServerActions): import("vite").Plugin;
export type OptionsServerActions = {
    src?: string;
    type?: "vercel" | "cloudflare" | "netlify";
    options?: {
        src: string;
        href: string;
    };
    folder?: string;
};
