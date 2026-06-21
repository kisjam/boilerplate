import { rmSync } from "node:fs";

/** dist ディレクトリを削除（DAG 外、build の最初に明示実行） */
export default {
	name: "clean",
	deps: [],

	async run(ctx) {
		rmSync(ctx.paths.dist, { recursive: true, force: true });
		ctx.log.success(`Cleaned ${ctx.config.dist} directory`);
	},
};
