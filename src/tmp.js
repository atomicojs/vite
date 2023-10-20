import { writeFile, mkdir } from "fs/promises";
import { rmdirSync } from "fs";
import { fileURLToPath } from "url";
import { hash } from "@uppercod/hash";

const folderId = fileURLToPath(
	new URL(
		`../cache/${hash(Date.now() + "-" + Math.random())}`,
		import.meta.url,
	),
).replaceAll("\\", "/");

const loadFolderId = mkdir(folderId, { recursive: true });

export const getTmp = (file) => `${folderId}/${file}`;

export const write = async (file, code) => {
	await loadFolderId;
	return writeFile(file, code);
};

process.on("exit", async () => rmdirSync(folderId, { recursive: true }));
