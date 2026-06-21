import { promises as fs } from "node:fs";
import path from "node:path";
import { glob } from "../utils.js";

export default {
	name: "images",
	deps: [],
	watch: (ctx) => ({
		paths: [ctx.paths.assets.images],
		match: /\.(jpg|jpeg|png|gif|svg|webp|avif|ico|bmp|tiff?)$/i,
	}),

	async run(ctx) {
		const srcDir = ctx.paths.assets.images;
		const distDir = ctx.paths.output.images;

		await fs.mkdir(distDir, { recursive: true });

		const files = await glob("**/*", {
			cwd: srcDir,
			nodir: true,
			reject: (f) => /\.(jpe?g|png)$/i.test(f),
		});

		if (files.length === 0) {
			ctx.log.info("No images found");
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

		ctx.log.success(`Images: ${files.length} files`);
	},

	async incremental(ctx, opts) {
		if (opts.event === "unlink") {
			await this.run(ctx, opts);
			return;
		}

		const srcDir = ctx.paths.assets.images;
		const distDir = ctx.paths.output.images;
		const relativePath = path.relative(srcDir, opts.path);
		const ext = path.extname(relativePath).toLowerCase();

		if (ext === ".jpg" || ext === ".jpeg" || ext === ".png") {
			ctx.log.info(`Skipped (webp): ${path.basename(relativePath)}`);
			return;
		}

		const distPath = path.join(distDir, relativePath);
		await fs.mkdir(path.dirname(distPath), { recursive: true });
		await fs.copyFile(opts.path, distPath);
		ctx.log.success(`Copied: ${path.basename(relativePath)}`);
	},
};
