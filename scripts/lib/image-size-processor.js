import imageSize from 'image-size';
import path from 'path';
import fs from 'fs';

// キャッシュ（ビルド中のメモリキャッシュ）
const sizeCache = new Map();

/**
 * 画像のサイズを取得（キャッシュ付き）
 * @param {string} imagePath - 画像ファイルのパス
 * @returns {{width: number, height: number} | null}
 */
function getImageSize(imagePath) {
	// キャッシュチェック
	if (sizeCache.has(imagePath)) {
		return sizeCache.get(imagePath);
	}

	try {
		// ファイルの存在確認
		if (!fs.existsSync(imagePath)) {
			console.warn(`Image not found: ${imagePath}`);
			return null;
		}

		// サイズ取得
		const dimensions = imageSize(imagePath);
		const result = {
			width: dimensions.width,
			height: dimensions.height
		};

		// キャッシュに保存
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
	// img要素を検索する正規表現
	const imgRegex = /<img([^>]*)>/g;
	
	return html.replace(imgRegex, (match, attributes) => {
		// すでにwidth/heightがある場合はスキップ
		if (/\bwidth\s*=/.test(attributes) && /\bheight\s*=/.test(attributes)) {
			return match;
		}

		// src属性を抽出
		const srcMatch = /\bsrc\s*=\s*["']([^"']+)["']/.exec(attributes);
		if (!srcMatch) {
			return match;
		}

		const src = srcMatch[1];
		
		// 外部URLはスキップ
		if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//')) {
			return match;
		}

		// 画像パスを解決
		const imagePath = src.startsWith('/')
			? path.join(baseDir, 'dist', src)
			: path.join(baseDir, 'dist', path.dirname(src), path.basename(src));

		// サイズ取得
		const size = getImageSize(imagePath);
		if (!size) {
			return match;
		}

		// width/height属性を追加
		// 既存の属性を保持しつつ、新しい属性を追加
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

export {
	getImageSize,
	processImageSizes,
	clearCache
};