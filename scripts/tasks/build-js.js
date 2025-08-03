#!/usr/bin/env node
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";
import config from "../../build.config.js";
import { logger } from "../utils.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const rootDir = resolve(__dirname, "../..");

const args = process.argv.slice(2);
const isProd = args.includes("--prod");

try {
	await build({
		root: rootDir,
		build: {
			rollupOptions: {
				input: resolve(rootDir, config.assets.js, "app.ts"),
				output: {
					entryFileNames: "bundle.js",
					assetFileNames: "[name][extname]",
				},
			},
			outDir: resolve(
				rootDir,
				config.dist,
				config.basePath ? config.basePath.replace(/^\//, "") : "",
				config.output.js,
			),
			emptyOutDir: false,
			sourcemap: !isProd,
			minify: isProd,
		},
		esbuild: {
			target: "es2020",
		},
	});

	logger.success(`JavaScript: Compiled bundle.js`);
} catch (error) {
	logger.error(`JavaScript failed: ${error}`);
	process.exit(1);
}
