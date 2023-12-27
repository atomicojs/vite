import { copyFile } from "fs/promises";
/**
 *
 * @param {string} id
 * @param {string} dest
 */
export const copy = (id, dest) =>
	copyFile(new URL(`../${id}`, import.meta.url), dest);
