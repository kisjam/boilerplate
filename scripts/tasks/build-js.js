#!/usr/bin/env node
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";
import config from "../../build.config.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const rootDir = resolve(__dirname, "../..");

// 引数で本番ビルドを制御
const args = process.argv.slice(2);
const isProd = args.includes("--prod");

console.log(`ℹ Building JavaScript${isProd ? " (production)" : ""}...`);

try {
	await build({
		root: rootDir,
		build: {
			lib: {
				entry: resolve(rootDir, config.assets.js, "app.ts"),
				name: "App",
				fileName: "bundle",
				formats: ["iife"],
			},
			outDir: resolve(rootDir, config.dist, "assets/js"),
			emptyOutDir: false,
			sourcemap: !isProd,
			minify: isProd,
			rollupOptions: {
				output: {
					assetFileNames: "[name][extname]",
				},
			},
		},
		esbuild: {
			target: "es2020",
		},
	});

	console.log("✓ JavaScript build completed");
} catch (error) {
	console.error("❌ JavaScript build failed:", error);
	process.exit(1);
}
