import fs from "node:fs";
import path from "node:path";
import imageSize from "image-size";

const sizeCache = new Map();

/**
 * 画像のサイズを取得（キャッシュ付き）
 * @param {string} imagePath - 画像ファイルのパス
 * @returns {{width: number, height: number} | null}
 */
function getImageSize(imagePath) {
	if (sizeCache.has(imagePath)) {
		return sizeCache.get(imagePath);
	}

	try {
		if (!fs.existsSync(imagePath)) {
			console.warn(`Image not found: ${imagePath}`);
			return null;
		}

		const buffer = fs.readFileSync(imagePath);
		const dimensions = imageSize(buffer);
		const result = {
			width: dimensions.width,
			height: dimensions.height,
		};

		sizeCache.set(imagePath, result);
		return result;
	} catch (error) {
		console.warn(`Failed to get image size for ${imagePath}:`, error.message);
		return null;
	}
}

/**
 * HTMLのimg要素にwidth/height属性を追加
 * @param {string} html - 処理対象のHTML
 * @param {string} baseDir - 画像パスの基準ディレクトリ
 * @returns {string} - 処理済みのHTML
 */
function processImageSizes(html, baseDir) {
	const imgRegex = /<img([^>]*)>/g;

	return html.replace(imgRegex, (match, attributes) => {
		if (/\bwidth\s*=/.test(attributes) && /\bheight\s*=/.test(attributes)) {
			return match;
		}

		const srcMatch = /\bsrc\s*=\s*["']([^"']+)["']/.exec(attributes);
		if (!srcMatch) {
			return match;
		}

		const src = srcMatch[1];

		if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("//")) {
			return match;
		}

		const imagePath = src.startsWith("/")
			? path.join(baseDir, "dist", src)
			: path.join(baseDir, "dist", path.dirname(src), path.basename(src));

		const size = getImageSize(imagePath);
		if (!size) {
			return match;
		}

		const newAttributes = `${attributes} width="${size.width}" height="${size.height}"`;

		return `<img${newAttributes}>`;
	});
}

/**
 * キャッシュをクリア
 */
function clearCache() {
	sizeCache.clear();
}

export { getImageSize, processImageSizes, clearCache };
