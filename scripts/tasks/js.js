import path from "node:path";
import { build } from "vite";

/** TypeScript → bundle.js（Vite / Rollup）。incremental 未定義 → 毎回フルビルド */
export default {
	name: "js",
	deps: [],
	watch: (ctx) => ({ paths: [ctx.paths.assets.js], match: /\.(ts|js)$/ }),

	async run(ctx, opts) {
		const isProd = opts?.prod === true;

		await build({
			root: ctx.root,
			build: {
				rollupOptions: {
					input: path.join(ctx.paths.assets.js, "app.ts"),
					output: {
						entryFileNames: "bundle.js",
						assetFileNames: "[name][extname]",
					},
				},
				outDir: ctx.paths.output.js,
				emptyOutDir: false,
				sourcemap: !isProd,
				minify: isProd,
			},
			esbuild: { target: "es2020" },
		});

		ctx.log.success("JavaScript: Compiled bundle.js");
	},
};
