#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";
import { glob } from "glob";
import config from "../../build.config.js";

async function buildSVGSprite() {
	const startTime = performance.now();
	
	try {
		// SVGファイルを取得
		const svgFiles = await glob("src/assets/icons/**/*.svg");
		
		if (svgFiles.length === 0) {
			console.log("No SVG files found");
			return;
		}
		
		// スプライト開始タグ
		let sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">`;
		
		// 各SVGファイルを処理
		for (const file of svgFiles) {
			const content = await fs.readFile(file, "utf8");
			const fileName = path.basename(file, ".svg");
			
			// SVGの内容を抽出して<symbol>でラップ
			const svgMatch = content.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
			if (svgMatch) {
				const viewBoxMatch = content.match(/viewBox="([^"]*)"/);
				const viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 24 24";
				
				sprite += `
	<symbol id="icon-${fileName}" viewBox="${viewBox}">
		${svgMatch[1].trim()}
	</symbol>`;
			}
		}
		
		sprite += "\n</svg>";
		
		// dist/assets/icons/ ディレクトリを作成
		const outputDir = path.join(config.dist, "assets/icons");
		await fs.mkdir(outputDir, { recursive: true });
		
		// スプライトファイルを書き込み
		await fs.writeFile(path.join(outputDir, "sprite.svg"), sprite);
		
		const totalTime = Math.round(performance.now() - startTime);
		console.log(`✓ SVG sprite generated (${totalTime}ms) - ${svgFiles.length} icons`);
	} catch (error) {
		console.error("SVG sprite generation failed:", error);
		process.exit(1);
	}
}

buildSVGSprite();