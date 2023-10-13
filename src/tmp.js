import { writeFile } from "fs/promises";
import { fileURLToPath } from "url";

export const getTmp = (file) =>
	fileURLToPath(new URL(`../cache/${file}`, import.meta.url)).replaceAll(
		"\\",
		"/",
	);

export const write = (file, code) => writeFile(file, code);
