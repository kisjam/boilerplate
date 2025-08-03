import fs from "node:fs";
import path from "node:path";
import pc from "picocolors";

const fsPromises = fs.promises;

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

async function writeJSON(filePath, data) {
	try {
		await fsPromises.writeFile(filePath, JSON.stringify(data, null, 2));
	} catch (err) {
		throw new Error(`Failed to write JSON file ${filePath}: ${err.message}`);
	}
}

const logger = {
	info: (message) => console.log(pc.blue("ℹ"), message),
	success: (message) => console.log(pc.green("✓"), message),
	warning: (message) => console.log(pc.yellow("⚠"), message),
	error: (message) => console.error(pc.red("✗"), pc.red(message)),
	debug: (message) => {
		if (process.env.DEBUG) {
			console.log(pc.gray("▸"), message);
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

async function fileExists(filePath) {
	try {
		await fsPromises.access(filePath);
		return true;
	} catch {
		return false;
	}
}

function getRelativePath(from, to) {
	return path.relative(from, to).replace(/\\/g, "/");
}

export {
	ensureDir,
	readJSON,
	writeJSON,
	logger,
	processInParallel,
	fileExists,
	getRelativePath,
};
