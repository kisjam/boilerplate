import fs from "node:fs";
import path from "node:path";
import imageSize from "image-size";
import { logger } from "../utils.js";

const sizeCache = new Map();

/**
 * 画像サイズを取得（キャッシュ付き）
 * @param {string} imagePath
 * @returns {{width: number, height: number} | null}
 */
export function getImageSize(imagePath) {
	if (sizeCache.has(imagePath)) {
		return sizeCache.get(imagePath);
	}

	try {
		if (!fs.existsSync(imagePath)) {
			logger.debug(`Image not found: ${imagePath}`);
			return null;
		}
		const dimensions = imageSize(fs.readFileSync(imagePath));
		const result = { width: dimensions.width, height: dimensions.height };
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
 */
export function processImageSizes(html, distDir) {
	return html.replace(/<img([^>]*)>/g, (match, attributes) => {
		if (/\bwidth\s*=/.test(attributes) && /\bheight\s*=/.test(attributes)) {
			return match;
		}

		const srcMatch = /\bsrc\s*=\s*["']([^"']+)["']/.exec(attributes);
		if (!srcMatch) return match;

		const src = srcMatch[1];
		if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("//")) {
			return match;
		}

		const size = getImageSize(path.join(distDir, src));
		if (!size) return match;

		return `<img${attributes} width="${size.width}" height="${size.height}">`;
	});
}

export function clearCache() {
	sizeCache.clear();
}
