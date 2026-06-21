import { promises as fs } from "node:fs";
import path from "node:path";
import { glob } from "../utils.js";

export default {
	name: "copy",
	deps: [],
	watch: (ctx) => ({ paths: [ctx.paths.public], match: /.*/ }),

	async run(ctx) {
		const srcDir = ctx.paths.public;
		const distDir = ctx.paths.distBase;

		await fs.mkdir(distDir, { recursive: true });

		const files = await glob("**/*", { cwd: srcDir, nodir: true });

		if (files.length === 0) {
			ctx.log.info("No files to copy from public directory");
			return;
		}

		await Promise.all(
			files.map(async (file) => {
				const srcPath = path.join(srcDir, file);
				const distPath = path.join(distDir, file);
				await fs.mkdir(path.dirname(distPath), { recursive: true });
				await fs.copyFile(srcPath, distPath);
			}),
		);

		ctx.log.success(`Copied ${files.length} files from ${srcDir} to ${distDir}`);
	},

	async incremental(ctx, opts) {
		await this.run(ctx, opts);
	},
};
