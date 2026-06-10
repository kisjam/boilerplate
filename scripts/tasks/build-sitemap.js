#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { glob } from "glob";
import config from "../../build.config.js";
import { ensureDir, logger, readJSON } from "../utils.js";

const fsPromises = fs.promises;

const srcDir = config.assets.html;
const distDir = path.join(config.dist, config.basePath || "");

function liquidPathToUrlPath(liquidRelPath) {
	const withoutExt = liquidRelPath.replace(/\.liquid$/, "");
	const parts = withoutExt.split("/");

	if (parts[parts.length - 1] === "index") {
		parts.pop();
		return parts.length === 0 ? "/" : `/${parts.join("/")}/`;
	}

	return `/${parts.join("/")}.html`;
}

function buildSiteUrl(siteUrl, basePath) {
	let base = (siteUrl || "").replace(/\/$/, "");
	const bp = (basePath || "").replace(/^\//, "").replace(/\/$/, "");
	if (bp) {
		base = `${base}/${bp}`;
	}
	return base;
}

function formatDate(date) {
	return date.toISOString().slice(0, 10);
}

async function buildSitemap() {
	const startTime = performance.now();
	logger.info("Starting sitemap build...");

	try {
		const dataPath = path.join(srcDir, "_config/site.json");
		const siteData = await readJSON(dataPath);

		if (!siteData) {
			logger.error("Site configuration not found at _config/site.json");
			process.exit(1);
		}

		const siteUrl = siteData?.site?.url || "";
		if (!siteUrl || siteUrl === "https://" || siteUrl === "http://") {
			logger.warning(
				`site.url is a placeholder ("${siteUrl}"). sitemap will be generated with incomplete URLs.`,
			);
		}

		const excludePatterns = config.sitemap?.exclude ?? [];
		const ignorePatterns = excludePatterns.map((p) => `pages/${p}`);

		const files = await glob("pages/**/*.liquid", {
			cwd: srcDir,
			ignore: ignorePatterns,
		});

		if (files.length === 0) {
			logger.warning("No .liquid files found in pages directory");
			return;
		}

		const baseUrl = buildSiteUrl(siteUrl, config.basePath);

		const entries = await Promise.all(
			files.map(async (file) => {
				const relativePath = file.replace(/^pages\//, "");
				const urlPath = liquidPathToUrlPath(relativePath);
				const fullUrl = `${baseUrl}${urlPath}`;

				const filePath = path.join(srcDir, file);
				const stat = await fsPromises.stat(filePath);
				const lastmod = formatDate(stat.mtime);

				return { url: fullUrl, lastmod };
			}),
		);

		entries.sort((a, b) => a.url.localeCompare(b.url));

		const urlElements = entries
			.map(
				({ url, lastmod }) =>
					`  <url>\n    <loc>${url}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`,
			)
			.join("\n");

		const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlElements}\n</urlset>\n`;

		await ensureDir(distDir);
		const outputPath = path.join(distDir, "sitemap.xml");
		await fsPromises.writeFile(outputPath, xml, "utf8");

		const totalTime = Math.round(performance.now() - startTime);
		logger.success(`Sitemap: Generated ${entries.length} URLs → ${outputPath} (${totalTime}ms)`);
	} catch (error) {
		logger.error(`Sitemap build failed: ${error.message}`);
		process.exit(1);
	}
}

buildSitemap();
