import { test, expect } from "vitest";
import { readFile } from "fs/promises";
import glob from "fast-glob";
import path from "path";

test("compare", async () => {
	const filesExpect = await glob("./tests/expect/**/*");
	const filesBuild = await glob("./tests/build/**/*");

	const filesWithContentExpect = (
		await Promise.all(
			filesExpect.map(async (file) => ({
				content: await readFile(file, "utf8"),
				name: path.extname(file),
			})),
		)
	).reduce((files, file) => ({ ...files, [file.name]: file }), {});

	const filesWithContentBuild = (
		await Promise.all(
			filesBuild.map(async (file) => ({
				content: await readFile(file, "utf8"),
				name: path.extname(file),
			})),
		)
	).reduce((files, file) => ({ ...files, [file.name]: file }), {});

	expect(filesWithContentExpect).toEqual(filesWithContentBuild);
});
