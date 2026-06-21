import { promises as fs } from "node:fs";
import path from "node:path";
import * as prettier from "prettier";
import { processImageSizes } from "../lib/image-size.js";
import { ensureDir, glob, processInParallel, readJSON } from "../utils.js";

const SELF_CLOSING =
	/<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)([^>]*?)\s*\/>/gi;

/** 1ファイルを描画して dist へ書き出す。file は srcDir からの相対（例 "pages/x.liquid"） */
async function renderOne(ctx, siteData, file) {
	const srcDir = ctx.paths.assets.html;
	const inputPath = path.join(srcDir, file);
	const relativePath = path.relative(path.join(srcDir, "pages"), inputPath);
	const outputPath = path.join(ctx.paths.distBase, relativePath.replace(".liquid", ".html"));

	const templateContent = await fs.readFile(inputPath, "utf8");
	const data = {
		...siteData,
		filename: file.replace("pages/", "").replace(".liquid", "").split("/"),
	};

	let html = await ctx.engines.liquid().parseAndRender(templateContent, data);
	html = await processImageSizes(html, ctx.paths.dist);

	try {
		html = await prettier.format(html, { parser: "html", ...ctx.config.html.prettier });
	} catch (error) {
		ctx.log.warning(`prettier format skipped for ${file}: ${error.message}`);
	}

	html = html.replace(SELF_CLOSING, "<$1$2>");

	await ensureDir(path.dirname(outputPath));
	await fs.writeFile(outputPath, html);
	return path.basename(outputPath);
}

async function loadSiteData(ctx) {
	const siteData = await readJSON(path.join(ctx.paths.assets.html, "_config/site.json"));
	if (!siteData) {
		throw new Error("Site configuration not found at _config/site.json");
	}
	return siteData;
}

async function buildAll(ctx) {
	const siteData = await loadSiteData(ctx);
	const files = await glob("pages/**/*.liquid", { cwd: ctx.paths.assets.html });
	if (files.length === 0) {
		ctx.log.warning("No .liquid files found in pages directory");
		return;
	}
	await processInParallel(files, (file) => renderOne(ctx, siteData, file), 5);
	ctx.log.success(`HTML build completed - ${files.length} files`);
}

export default {
	name: "html",
	// smart-svg がアイコン(svg-sprite 出力)を、image-size が画像(images/webp/copy 出力)を
	// dist から読むため、それらの後に実行する必要がある
	deps: ["images", "webp", "copy", "svg-sprite"],
	watch: (ctx) => ({ paths: [ctx.paths.assets.html], match: /\.liquid$/ }),

	async run(ctx) {
		await buildAll(ctx);
	},

	// dev: 共有パーシャル(_components/_layouts/_config)や unlink は全体再ビルド、
	// pages 配下の単一ページ変更はその1ファイルだけ描画
	async incremental(ctx, opts) {
		const srcDir = ctx.paths.assets.html;
		const abs = opts?.path;
		const rel = abs ? path.relative(srcDir, abs) : "";
		const isShared =
			rel.startsWith("_components/") || rel.startsWith("_layouts/") || rel.startsWith("_config/");

		if (opts?.event === "unlink" || isShared || !rel.startsWith("pages/")) {
			await buildAll(ctx);
			return;
		}

		const siteData = await loadSiteData(ctx);
		const built = await renderOne(ctx, siteData, rel);
		ctx.log.success(`HTML: Built ${built}`);
	},
};
