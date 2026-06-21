import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { glob, processInParallel } from "../utils.js";

export default {
	name: "webp",
	deps: [],
	watch: (ctx) => ({
		paths: [ctx.paths.assets.images],
		match: /\.(jpg|jpeg|png)$/i,
	}),

	async run(ctx) {
		const srcDir = ctx.paths.assets.images;
		const distDir = ctx.paths.output.images;

		const files = await glob("**/*.{jpg,jpeg,png}", { cwd: srcDir });

		if (files.length === 0) {
			ctx.log.info("No images found");
			return;
		}

		const convertFile = async (file) => {
			const inputPath = path.join(srcDir, file);
			const ext = path.extname(inputPath).toLowerCase();
			const basename = path.basename(inputPath, ext);
			const outputDir = path.join(distDir, path.dirname(file));
			const outputWebP = path.join(outputDir, `${basename}.webp`);
			const outputAvif = path.join(outputDir, `${basename}.avif`);

			await fs.mkdir(outputDir, { recursive: true });

			try {
				await Promise.all([
					sharp(inputPath).webp({ quality: 80 }).toFile(outputWebP),
					sharp(inputPath).avif({ quality: 50 }).toFile(outputAvif),
				]);
				ctx.log.success(`Converted: ${basename}.webp, ${basename}.avif`);
				return { webp: outputWebP, avif: outputAvif };
			} catch (error) {
				ctx.log.error(`Failed: ${file} - ${error.message}`);
				return null;
			}
		};

		const results = await processInParallel(files, convertFile);
		const converted = results.filter((r) => r !== null).length;
		ctx.log.success(`WebP + AVIF: ${converted} files`);
	},

	async incremental(ctx, opts) {
		if (opts.event === "unlink") {
			await this.run(ctx, opts);
			return;
		}

		const ext = path.extname(opts.path).toLowerCase();
		if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
			return;
		}

		const srcDir = ctx.paths.assets.images;
		const distDir = ctx.paths.output.images;
		const relativePath = path.relative(srcDir, opts.path);
		const inputPath = opts.path;
		const extName = path.extname(inputPath).toLowerCase();
		const basename = path.basename(inputPath, extName);
		const outputDir = path.join(distDir, path.dirname(relativePath));
		const outputWebP = path.join(outputDir, `${basename}.webp`);
		const outputAvif = path.join(outputDir, `${basename}.avif`);

		await fs.mkdir(outputDir, { recursive: true });

		try {
			await Promise.all([
				sharp(inputPath).webp({ quality: 80 }).toFile(outputWebP),
				sharp(inputPath).avif({ quality: 50 }).toFile(outputAvif),
			]);
			ctx.log.success(`Converted: ${basename}.webp, ${basename}.avif`);
		} catch (error) {
			ctx.log.error(`Failed: ${relativePath} - ${error.message}`);
		}
	},
};
