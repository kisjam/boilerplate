import { promises as fs } from "node:fs";
import path from "node:path";

const BREAKPOINT_KEYS = ["sm", "md", "lg", "xl", "2xl"];

/** breakpoints から Tailwind のテーマ CSS を生成し SCSS として書き出す */
export default {
	name: "tailwind",
	deps: [],
	// dev: breakpoints 変更 + html/js のクラス変更でユーティリティを再生成
	watch: (ctx) => ({
		paths: [ctx.breakpointsPath, ctx.paths.assets.html, ctx.paths.assets.js],
		match: /\.(liquid|ts|js)$/,
	}),

	async run(ctx) {
		const startTime = performance.now();
		const { breakpoints } = ctx;

		const breakpointLines = BREAKPOINT_KEYS.map(
			(key) => `\t\t\t\t--breakpoint-${key}: ${breakpoints[key] + 1}px;`,
		).join("\n");

		// --spacing は Tailwind 専用の単一定数（JS/手書きCSSは未使用）のため直書き
		const tailwindCSS = `
				/* Tailwind CSS - Theme & Utilities */
				@source not inline("static");
				@theme static {
					--spacing: 1px;
${breakpointLines}
				}
				@import "tailwindcss/theme";
				@import "tailwindcss/utilities";
			`;

		const outputPath = path.join(ctx.paths.assets.css, ctx.config.tailwind.outputFile);
		const processed = await ctx.engines.tailwindProcessor().process(tailwindCSS, {
			from: path.join(ctx.paths.assets.css, "style.scss"),
			to: outputPath,
			map: false,
		});

		await fs.writeFile(outputPath, processed.css);

		const totalTime = Math.round(performance.now() - startTime);
		ctx.log.success(`Tailwind build completed (${totalTime}ms)`);
	},
};
