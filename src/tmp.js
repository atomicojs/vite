import { writeFile, mkdir } from "fs/promises";
import { rmSync } from "fs";
import { fileURLToPath } from "url";
import { md5 } from "./plugins/utils.js";
import { subscribe } from "@uppercod/clean-terminal";

const folderId = fileURLToPath(
	new URL(
		`../cache/${md5(Date.now() + "-" + Math.random())}`,
		import.meta.url,
	),
).replaceAll("\\", "/");

const loadFolderId = mkdir(folderId, { recursive: true });

export const getTmp = (file) => `${folderId}/${file}`;

export const write = async (file, code) => {
	await loadFolderId;
	return writeFile(file, code);
};

subscribe(() => rmSync(folderId, { recursive: true }));
