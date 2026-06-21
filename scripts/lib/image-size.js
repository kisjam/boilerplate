import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { logger } from "../utils.js";

const sizeCache = new Map();

const IMG_RE = /<img([^>]*)>/g;
const SRC_RE = /\bsrc\s*=\s*["']([^"']+)["']/;
const hasWH = (attrs) => /\bwidth\s*=/.test(attrs) && /\bheight\s*=/.test(attrs);
const isRemote = (src) =>
	src.startsWith("http://") || src.startsWith("https://") || src.startsWith("//");

/**
 * 画像サイズを取得（キャッシュ付き、sharp のメタデータを使用）
 * @param {string} imagePath
 * @returns {Promise<{width: number, height: number} | null>}
 */
async function getImageSize(imagePath) {
	if (sizeCache.has(imagePath)) {
		return sizeCache.get(imagePath);
	}

	if (!fs.existsSync(imagePath)) {
		logger.debug(`Image not found: ${imagePath}`);
		sizeCache.set(imagePath, null);
		return null;
	}

	try {
		const { width, height } = await sharp(imagePath).metadata();
		const result = width && height ? { width, height } : null;
		sizeCache.set(imagePath, result);
		return result;
	} catch (error) {
		logger.warning(`Failed to get image size for ${imagePath}: ${error.message}`);
		return null;
	}
}

/**
 * HTML の <img> に width/height を補完。ローカル画像は distDir/src を読む。
 * @param {string} html
 * @param {string} distDir - 画像が出力されている dist ディレクトリ（絶対）
 * @returns {Promise<string>}
 */
export async function processImageSizes(html, distDir) {
	const targets = new Set();
	for (const m of html.matchAll(IMG_RE)) {
		const attributes = m[1];
		if (hasWH(attributes)) continue;
		const srcMatch = SRC_RE.exec(attributes);
		if (!srcMatch || isRemote(srcMatch[1])) continue;
		targets.add(srcMatch[1]);
	}

	const sizes = new Map();
	await Promise.all(
		[...targets].map(async (src) => {
			sizes.set(src, await getImageSize(path.join(distDir, src)));
		}),
	);

	return html.replace(IMG_RE, (match, attributes) => {
		if (hasWH(attributes)) return match;
		const srcMatch = SRC_RE.exec(attributes);
		if (!srcMatch || isRemote(srcMatch[1])) return match;
		const size = sizes.get(srcMatch[1]);
		if (!size) return match;
		return `<img${attributes} width="${size.width}" height="${size.height}">`;
	});
}

export function clearCache() {
	sizeCache.clear();
}
