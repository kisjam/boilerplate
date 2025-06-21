#!/usr/bin/env node
import crypto from "node:crypto";
import fsSync, { promises as fs } from "node:fs";
import path from "node:path";
import { glob } from "glob";
import sharp from "sharp";
import config from "../../build.config.js";

const srcDir = config.assets.images;
const distDir = path.join(config.dist, "assets/images");

// オプション設定
const useCache = process.argv.includes("--cached");
const cacheFile = ".webp-cache.json";

// ファイルのMD5ハッシュを計算
async function calculateFileHash(filePath) {
	const fileBuffer = await fs.readFile(filePath);
	const hashSum = crypto.createHash("md5");
	hashSum.update(fileBuffer);
	return hashSum.digest("hex");
}

// キャッシュの読み込み
async function loadCache() {
	if (!useCache) return {};

	try {
		const data = await fs.readFile(cacheFile, "utf8");
		return JSON.parse(data);
	} catch {
		return {};
	}
}

// キャッシュの保存
async function saveCache(cache) {
	if (!useCache) return;
	await fs.writeFile(cacheFile, JSON.stringify(cache, null, 2));
}

// 単一ファイルの変換
async function convertToWebP(file, cache = {}) {
	const inputPath = path.join(srcDir, file);
	const outputPath = path.join(distDir, file);
	const ext = path.extname(inputPath).toLowerCase();
	const basename = path.basename(inputPath, ext);
	const outputWebP = path.join(path.dirname(outputPath), `${basename}.webp`);

	if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
		return null;
	}

	// キャッシュチェック
	if (useCache) {
		const fileHash = await calculateFileHash(inputPath);
		const needsConversion =
			!cache[inputPath] || cache[inputPath].hash !== fileHash || !fsSync.existsSync(outputWebP);

		if (!needsConversion) {
			console.log(`⏭️  Skipped (unchanged): ${file}`);
			return null;
		}
	}

	await fs.mkdir(path.dirname(outputWebP), { recursive: true });

	try {
		await sharp(inputPath).webp({ quality: 80 }).toFile(outputWebP);

		console.log(`✓ Converted: ${file} -> ${basename}.webp`);

		// 元画像を削除
		if (fsSync.existsSync(outputPath)) {
			await fs.unlink(outputPath);
			console.log(`✓ Removed original: ${file}`);
		}

		// キャッシュ更新
		if (useCache) {
			cache[inputPath] = {
				hash: await calculateFileHash(inputPath),
				output: outputWebP,
				timestamp: new Date().toISOString(),
			};
		}

		return outputWebP;
	} catch (error) {
		console.error(`✗ Failed to convert ${file}:`, error.message);
		return null;
	}
}

// メイン処理
async function buildImagesWebP() {
	console.log("ℹ Starting WebP conversion...");

	try {
		// キャッシュ読み込み
		const cache = await loadCache();

		// 画像ファイルを検索
		const pattern = "**/*.{jpg,jpeg,png}";
		const files = await glob(pattern, { cwd: srcDir });

		if (files.length === 0) {
			console.log("No images found to convert.");
			return;
		}

		// 並列処理で変換
		const results = await Promise.all(files.map((file) => convertToWebP(file, cache)));

		// キャッシュ保存
		await saveCache(cache);

		// 結果集計
		const converted = results.filter((r) => r !== null).length;
		console.log(`✓ WebP conversion completed - ${converted} files processed`);
	} catch (error) {
		console.error("WebP conversion failed:", error);
		process.exit(1);
	}
}

// 実行
buildImagesWebP();
