import { resolve } from "path";
import { defineConfig } from "vite";
import config from "./build.config.js";

export default defineConfig({
	root: config.src,
	build: {
		outDir: resolve(config.dist, "assets/js"),
		emptyOutDir: true,
		rollupOptions: {
			input: resolve(__dirname, config.assets.js, "app.ts"),
			output: {
				entryFileNames: "bundle.js",
				assetFileNames: "[name].[ext]",
			},
		},
		sourcemap: true,
		target: "es2020",
	},
	resolve: {
		alias: {
			"@": resolve(__dirname, config.src),
		},
	},
});
