import { dir } from "../config.mjs";
import fs from "node:fs";
import path from "node:path";

async function copyDir(src, dest) {
	await fs.promises.mkdir(dest, { recursive: true });
	const entries = await fs.promises.readdir(src, { withFileTypes: true });

	for (const entry of entries) {
		const srcPath = path.join(src, entry.name);
		const destPath = path.join(dest, entry.name);

		if (entry.isDirectory()) {
			await copyDir(srcPath, destPath);
		} else {
			await fs.promises.copyFile(srcPath, destPath);
		}
	}
}

export const copyPublic = (done) => {
	copyDir(dir.src.public, dir.build.public)
		.then(() => done())
		.catch(done);
};
