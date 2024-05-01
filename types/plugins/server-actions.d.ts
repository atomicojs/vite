/**
 * @typedef {Object} OptionsServerActions
 * @property {string}  [src]
 * @property {TYPE_VERCEL|TYPE_CLOUDFLARE|TYPE_NETLIFY}  [type]
 * @property {string}  [folder]
 */
/**
 * @param {OptionsServerActions} options
 * @returns {import("vite").Plugin}
 */
export function pluginServerActions({ type, folder, src, }?: OptionsServerActions): import("vite").Plugin;
export type OptionsServerActions = {
    src?: string;
    type?: "vercel" | "cloudflare" | "netlify";
    folder?: string;
};
