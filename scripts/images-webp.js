#!/usr/bin/env node
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const { glob } = require("glob");
const crypto = require("crypto");
const config = require("../build.config");
const { ensureDir, readJSON, writeJSON, logger, processInParallel } = require("./utils");

const srcDir = config.assets.images;
const distDir = path.join(config.dist, "assets/images");

// オプション設定
const useCache = process.argv.includes("--cached");
const cacheFile = ".webp-cache.json";

// ファイルのMD5ハッシュを計算
function calculateFileHash(filePath) {
	const fileBuffer = fs.readFileSync(filePath);
	const hashSum = crypto.createHash("md5");
	hashSum.update(fileBuffer);
	return hashSum.digest("hex");
}

async function convertToWebP(file, cache = {}) {
	const inputPath = path.join(srcDir, file);
	const outputPath = path.join(distDir, file);
	const ext = path.extname(inputPath).toLowerCase();
	const basename = path.basename(inputPath, ext);
	const outputWebP = path.join(path.dirname(outputPath), `${basename}.webp`);

	if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
		return;
	}

	// キャッシュチェック
	if (useCache) {
		const fileHash = calculateFileHash(inputPath);
		const needsConversion =
			!cache[inputPath] || cache[inputPath].hash !== fileHash || !fs.existsSync(outputWebP);

		if (!needsConversion) {
			logger.info(`Skipped (unchanged): ${file}`);
			return;
		}
	}

	await ensureDir(path.dirname(outputWebP));

	try {
		await sharp(inputPath).webp({ quality: 80 }).toFile(outputWebP);
		logger.success(`Converted: ${file} -> ${path.basename(outputWebP)}`);

		// キャッシュを更新
		if (useCache) {
			cache[inputPath] = {
				hash: calculateFileHash(inputPath),
				destPath: outputWebP,
			};
		}
	} catch (err) {
		logger.error(`Failed to convert ${file}: ${err.message}`);
		throw err;
	}
}

async function main() {
	try {
		logger.info("Starting WebP conversion...");

		// キャッシュを読み込む
		let cache = {};
		if (useCache) {
			cache = (await readJSON(cacheFile)) || {};
		}

		const patterns = ["**/*.{jpg,jpeg,png}"];
		const files = await glob(patterns, { cwd: srcDir });

		if (files.length === 0) {
			logger.warning("No images found to convert");
			return;
		}

		await ensureDir(distDir);

		// 並列処理で画像を変換
		await processInParallel(
			files,
			(file) => convertToWebP(file, cache),
			10, // 最大10ファイル同時処理
		);

		// キャッシュファイルを保存
		if (useCache) {
			await writeJSON(cacheFile, cache);
			logger.success(`WebP conversion completed (cached mode) - ${files.length} files processed`);
		} else {
			logger.success(`WebP conversion completed - ${files.length} files processed`);
		}
	} catch (error) {
		logger.error(`WebP conversion failed: ${error.message}`);
		process.exit(1);
	}
}

main();
