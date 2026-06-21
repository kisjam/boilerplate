import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { glob, processInParallel } from "../utils.js";

async function convertFile(inputPath, outDir, baseName, log) {
	const outputWebP = path.join(outDir, `${baseName}.webp`);
	const outputAvif = path.join(outDir, `${baseName}.avif`);

	await fs.mkdir(outDir, { recursive: true });

	await Promise.all([
		sharp(inputPath).webp({ quality: 80 }).toFile(outputWebP),
		sharp(inputPath).avif({ quality: 50 }).toFile(outputAvif),
	]);
	log.success(`Converted: ${baseName}.webp, ${baseName}.avif`);
}

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

		const convert = async (file) => {
			const inputPath = path.join(srcDir, file);
			const ext = path.extname(inputPath).toLowerCase();
			const baseName = path.basename(inputPath, ext);
			const outDir = path.join(distDir, path.dirname(file));

			try {
				await convertFile(inputPath, outDir, baseName, ctx.log);
				return {
					webp: path.join(outDir, `${baseName}.webp`),
					avif: path.join(outDir, `${baseName}.avif`),
				};
			} catch (error) {
				ctx.log.error(`Failed: ${file} - ${error.message}`);
				return null;
			}
		};

		const results = await processInParallel(files, convert);
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
		const baseName = path.basename(opts.path, ext);
		const outDir = path.join(distDir, path.dirname(relativePath));

		try {
			await convertFile(opts.path, outDir, baseName, ctx.log);
		} catch (error) {
			ctx.log.error(`Failed: ${relativePath} - ${error.message}`);
		}
	},
};
