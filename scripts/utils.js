import fs from "node:fs";
import path from "node:path";
import { styleText } from "node:util";

const fsPromises = fs.promises;

/**
 * glob パッケージ互換の薄いラッパ（Node24 native fs.glob）。
 * @param {string} pattern
 * @param {{cwd?: string, nodir?: boolean, reject?: (relPath: string) => boolean}} [opts]
 * @returns {Promise<string[]>} cwd 相対（cwd 指定時）のパス配列。決定的にソート済み。
 */
async function glob(pattern, { cwd, nodir = false, reject } = {}) {
	const out = [];
	if (nodir) {
		for await (const d of fsPromises.glob(pattern, { cwd, withFileTypes: true })) {
			if (!d.isFile()) continue;
			const rel = cwd
				? path.relative(cwd, path.join(d.parentPath, d.name))
				: path.join(d.parentPath, d.name);
			if (reject?.(rel)) continue;
			out.push(rel);
		}
	} else {
		for await (const f of fsPromises.glob(pattern, { cwd })) {
			if (reject?.(f)) continue;
			out.push(f);
		}
	}
	return out.sort();
}

async function ensureDir(dir) {
	try {
		await fsPromises.mkdir(dir, { recursive: true });
	} catch (err) {
		throw new Error(`Failed to create directory ${dir}: ${err.message}`);
	}
}

async function readJSON(filePath) {
	try {
		const content = await fsPromises.readFile(filePath, "utf8");
		return JSON.parse(content);
	} catch (err) {
		if (err.code === "ENOENT") {
			return null;
		}
		throw new Error(`Failed to read JSON file ${filePath}: ${err.message}`);
	}
}

const logger = {
	info: (message) => console.log(styleText("blue", "ℹ"), message),
	success: (message) => console.log(styleText("green", "✓"), message),
	warning: (message) => console.log(styleText("yellow", "⚠"), message),
	error: (message) => console.error(styleText("red", "✗"), styleText("red", message)),
	debug: (message) => {
		if (process.env.DEBUG) {
			console.log(styleText("gray", "▸"), message);
		}
	},
};

async function processInParallel(items, processor, concurrency = 5) {
	const results = [];
	const queue = [...items];
	const inProgress = [];

	while (queue.length > 0 || inProgress.length > 0) {
		while (inProgress.length < concurrency && queue.length > 0) {
			const item = queue.shift();
			const promise = processor(item)
				.then((result) => {
					const index = inProgress.indexOf(promise);
					inProgress.splice(index, 1);
					return result;
				})
				.catch((err) => {
					const index = inProgress.indexOf(promise);
					inProgress.splice(index, 1);
					throw err;
				});
			inProgress.push(promise);
			results.push(promise);
		}

		if (inProgress.length > 0) {
			await Promise.race(inProgress);
		}
	}

	return Promise.all(results);
}

export { ensureDir, glob, logger, processInParallel, readJSON };
