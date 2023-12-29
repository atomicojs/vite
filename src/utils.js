import { readFile } from "fs/promises";

/**
 * @type {{[id:string]:Promise<string>}}
 */
const TEMPLATE_CACHE = {};
/**
 *
 * @param {string} id
 * @param {string} dest
 */
export const getTemplate = (id) =>
	new URL(`../templates/${id}`, import.meta.url);

export const getTemplateContent = (id) =>
	(TEMPLATE_CACHE[id] =
		TEMPLATE_CACHE[id] || readFile(getTemplate(id), "utf8"));
/**
 *
 * @param {string[]} src;
 * @returns {RegExp}
 */
export const getExtensions = (src) => {
	const files = src
		.filter((src) => !src.startsWith("!"))
		.map((src) => {
			const [, value] = src.match(/{([^}]+)}$/) || [];
			return value;
		})
		.filter((value) => value)
		.map((types) => types.split(","))
		.flat(2)
		.map((value) => `${value}`);
	return files.length ? RegExp(`\\.(${files.join("|")})$`) : null;
};
