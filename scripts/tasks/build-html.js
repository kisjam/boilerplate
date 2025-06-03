#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { glob } from "glob";
import yaml from "js-yaml";
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

// Front matterを解析
function parseFrontMatter(content) {
	const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
	const match = content.match(frontMatterRegex);

	if (!match) {
		return { frontMatter: {}, content };
	}

	try {
		const frontMatter = yaml.load(match[1]);
		return {
			frontMatter: frontMatter || {},
			content: match[2],
		};
	} catch (e) {
		logger.warning(`Failed to parse YAML front matter: ${e.message}`);
		return {
			frontMatter: {},
			content,
		};
	}
}

// HTMLファイルを処理
async function processHTMLFile(file, siteData) {
	const inputPath = path.join(srcDir, file);
	const relativePath = path.relative(path.join(srcDir, "pages"), inputPath);
	const outputPath = path.join(distDir, relativePath.replace(".liquid", ".html"));

	try {
		// テンプレートの内容を読み込む
		const templateContent = await fsPromises.readFile(inputPath, "utf8");

		// Front matterを解析
		const { frontMatter, content } = parseFrontMatter(templateContent);

		// テンプレートデータを準備
		const filenameParts = file.replace("pages/", "").replace(".liquid", "").split("/");

		const data = {
			...siteData,
			...frontMatter,
			filename: filenameParts,
			content: content,
		};

		let html;
		if (frontMatter.layout) {
			// コンテンツをレンダリング
			const renderedContent = await engine.parseAndRender(content, data);

			// レイアウトでラップ
			const layoutPath = path.join(srcDir, frontMatter.layout);
			const layoutContent = await fsPromises.readFile(layoutPath, "utf8");
			const layoutData = {
				...data,
				content: renderedContent,
			};
			html = await engine.parseAndRender(layoutContent, layoutData);
		} else {
			// スタンドアロンでレンダリング
			html = await engine.parseAndRender(content, data);
		}

		// 画像にwidth/height属性を追加
		html = processImageSizes(html, process.cwd());

		// 出力ディレクトリを作成
		await ensureDir(path.dirname(outputPath));

		// ファイルを書き込む
		await fsPromises.writeFile(outputPath, html);
		logger.success(
			`Built: ${getRelativePath(srcDir, inputPath)} -> ${getRelativePath(distDir, outputPath)}`,
		);
	} catch (err) {
		logger.error(`Failed to build ${file}: ${err.message}`);
		throw err;
	}
}

// メイン処理
async function main() {
	try {
		logger.info("Starting HTML build...");

		// サイトデータを読み込む
		const dataPath = path.join(srcDir, "_config/site.json");
		const siteData = await readJSON(dataPath);

		if (!siteData) {
			logger.error("Site configuration not found at _config/site.json");
			process.exit(1);
		}

		// すべての.liquidファイルを取得
		const files = await glob("pages/**/*.liquid", { cwd: srcDir });

		if (files.length === 0) {
			logger.warning("No .liquid files found in pages directory");
			return;
		}

		// 並列処理でHTMLファイルを生成
		await processInParallel(
			files,
			(file) => processHTMLFile(file, siteData),
			5, // 最大5ファイル同時処理
		);

		logger.success(`HTML build completed - ${files.length} files generated`);
	} catch (error) {
		logger.error(`Build failed: ${error.message}`);
		process.exit(1);
	}
}

main();
