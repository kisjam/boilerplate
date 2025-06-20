#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { glob } from "glob";
import { Liquid } from "liquidjs";
import config from "../../build.config.js";
import { processImageSizes } from "../lib/image-size-processor.js";
import { ensureDir, getRelativePath, logger, processInParallel, readJSON } from "../utils.js";

const fsPromises = fs.promises;

const srcDir = config.assets.html;
const distDir = config.dist;

// Configure LiquidJS
const engine = new Liquid({
	root: [srcDir, path.join(srcDir, "_components")],
	extname: ".liquid",
	cache: false,
});

// HTMLファイルを処理
async function processHTMLFile(file, siteData) {
	const inputPath = path.join(srcDir, file);
	const relativePath = path.relative(path.join(srcDir, "pages"), inputPath);
	const outputPath = path.join(distDir, relativePath.replace(".liquid", ".html"));

	try {
		// テンプレートの内容を読み込む
		const templateContent = await fsPromises.readFile(inputPath, "utf8");

		// テンプレートデータを準備
		const filenameParts = file.replace("pages/", "").replace(".liquid", "").split("/");

		const data = {
			...siteData,
			filename: filenameParts,
		};

		// スタンドアロンでレンダリング
		const html = await engine.parseAndRender(templateContent, data)

		// 画像にwidth/height属性を追加
		html = processImageSizes(html, process.cwd());

		// 出力ディレクトリを作成
		await ensureDir(path.dirname(outputPath));

		// ファイルを書き込む
		await fsPromises.writeFile(outputPath, html);
		// ログを簡略化（ファイル名のみ表示）
		logger.success(`Built: ${path.basename(outputPath)}`);
	} catch (err) {
		logger.error(`Failed to build ${file}: ${err.message}`);
		throw err;
	}
}

// メイン処理
async function main() {
	try {
		// コマンドライン引数を解析
		const args = process.argv.slice(2);
		const singleFileIndex = args.findIndex(arg => arg === '--single' || arg === '-s');
		let singleFilePath = null;
		
		if (singleFileIndex !== -1) {
			// --single 以降のすべての引数を結合（スペースを含むパス対応）
			const remainingArgs = args.slice(singleFileIndex + 1);
			singleFilePath = remainingArgs.join(' ');
		}

		if (!singleFilePath) {
			logger.info("Starting HTML build...");
		}

		// サイトデータを読み込む
		const dataPath = path.join(srcDir, "_config/site.json");
		const siteData = await readJSON(dataPath);

		if (!siteData) {
			logger.error("Site configuration not found at _config/site.json");
			process.exit(1);
		}

		let files;
		
		if (singleFilePath) {
			// 単一ファイルビルドモード
			let relativePath;
			let fullPath;
			
			// 相対パスか絶対パスかを判定
			if (path.isAbsolute(singleFilePath)) {
				fullPath = singleFilePath;
				relativePath = path.relative(srcDir, singleFilePath);
			} else {
				// 相対パスの場合、srcDirからの相対パスとして処理
				relativePath = singleFilePath;
				fullPath = path.join(srcDir, singleFilePath);
			}
			
			// pagesディレクトリ内のファイルかチェック
			if (!relativePath.startsWith('pages/') || !relativePath.endsWith('.liquid')) {
				logger.error(`Invalid file path: ${singleFilePath}. Must be a .liquid file in pages directory.`);
				process.exit(1);
			}
			
			// ファイルが存在するかチェック
			if (!fs.existsSync(fullPath)) {
				logger.error(`File not found: ${fullPath}`);
				process.exit(1);
			}
			
			files = [relativePath];
		} else {
			// 全ファイルビルドモード
			files = await glob("pages/**/*.liquid", { cwd: srcDir });

			if (files.length === 0) {
				logger.warning("No .liquid files found in pages directory");
				return;
			}
		}

		// 並列処理でHTMLファイルを生成
		await processInParallel(
			files,
			(file) => processHTMLFile(file, siteData),
			5, // 最大5ファイル同時処理
		);

		// 単一ファイルの場合は省略、複数ファイルの場合は簡潔に
		if (files.length > 1) {
			logger.success(`HTML build completed - ${files.length} files`);
		}
	} catch (error) {
		logger.error(`Build failed: ${error.message}`);
		process.exit(1);
	}
}

main();
