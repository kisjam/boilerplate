import fs from "fs";
import path from "path";
import chalk from "chalk";

const fsPromises = fs.promises;

// ディレクトリ作成
async function ensureDir(dir) {
	try {
		await fsPromises.mkdir(dir, { recursive: true });
	} catch (err) {
		throw new Error(`Failed to create directory ${dir}: ${err.message}`);
	}
}

// JSONファイル読み込み
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

// JSONファイル書き込み
async function writeJSON(filePath, data) {
	try {
		await fsPromises.writeFile(filePath, JSON.stringify(data, null, 2));
	} catch (err) {
		throw new Error(`Failed to write JSON file ${filePath}: ${err.message}`);
	}
}

// ロガー
const logger = {
	info: (message) => console.log(chalk.blue("ℹ"), message),
	success: (message) => console.log(chalk.green("✓"), message),
	warning: (message) => console.log(chalk.yellow("⚠"), message),
	error: (message) => console.error(chalk.red("✗"), message),
	debug: (message) => {
		if (process.env.DEBUG) {
			console.log(chalk.gray("▸"), message);
		}
	},
};

// 並列処理ヘルパー
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

// ファイル存在チェック
async function fileExists(filePath) {
	try {
		await fsPromises.access(filePath);
		return true;
	} catch {
		return false;
	}
}

// 相対パスを取得
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
