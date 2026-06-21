import { promises as fs } from "node:fs";
import path from "node:path";

/** design tokens(breakpoints) から SCSS 変数を生成 */
export default {
	name: "tokens",
	deps: [],
	watch: (ctx) => ({ paths: [ctx.tokensPath], match: /.*/ }),

	async run(ctx) {
		const startTime = performance.now();

		const lines = Object.entries(ctx.tokens.breakpoints)
			.map(([key, value]) => `\t${key}: ${value}px,`)
			.join("\n");

		const sassContent = `// [AUTO-GENERATED] This file is managed by build-tokens.js
$breakpoints: (
${lines}
);
`;

		const outputPath = path.join(ctx.paths.assets.css, "global/variable-sass/_breakpoints.scss");
		await fs.writeFile(outputPath, sassContent);

		const totalTime = Math.round(performance.now() - startTime);
		ctx.log.success(`Tokens build completed (${totalTime}ms)`);
	},
};
