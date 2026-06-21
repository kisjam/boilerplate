import fs from "node:fs";
import path from "node:path";

const HEADER = "// [AUTO-GENERATED] This file is managed by sass-glob.js";

/**
 * 1ディレクトリの _index.scss を生成。更新したら true を返す。
 * （旧実装の console.log モンキーパッチ＝ hasUpdates が常に false になるバグを排除）
 */
function generateIndexFile(sassDir, dirPath, force, log) {
	const fullPath = path.join(sassDir, dirPath);
	if (!fs.existsSync(fullPath)) return false;

	const entries = fs.readdirSync(fullPath, { withFileTypes: true });

	const scssFiles = entries
		.filter(
			(e) =>
				e.isFile() &&
				e.name.startsWith("_") &&
				e.name.endsWith(".scss") &&
				e.name !== "_index.scss",
		)
		.map((e) => e.name)
		.sort()
		.map((file) => `@forward "${file}";`);

	const subDirs = entries
		.filter((e) => e.isDirectory() && !e.name.startsWith("."))
		.filter((e) => fs.existsSync(path.join(fullPath, e.name, "_index.scss")))
		.map((e) => e.name)
		.sort()
		.map((dir) => `@forward "${dir}/_index.scss";`);

	const allImports = [...scssFiles, ...subDirs].join("\n");
	const content = allImports ? `${HEADER}\n\n${allImports}\n` : `${HEADER}\n`;

	const indexPath = path.join(fullPath, "_index.scss");
	let needsUpdate = force;
	if (!force) {
		needsUpdate = !fs.existsSync(indexPath) || fs.readFileSync(indexPath, "utf8") !== content;
	}

	if (needsUpdate) {
		fs.writeFileSync(indexPath, content);
		log.success(
			`Generated: ${path.relative(".", indexPath)} (${scssFiles.length} files, ${subDirs.length} directories)`,
		);
		return true;
	}
	return false;
}

/** 子ディレクトリを先に処理してから自身を生成。更新数を返す */
function generateRecursive(sassDir, dirPath, force, log) {
	const fullPath = path.join(sassDir, dirPath);
	if (!fs.existsSync(fullPath)) return 0;

	let updates = 0;
	for (const entry of fs.readdirSync(fullPath, { withFileTypes: true })) {
		if (entry.isDirectory() && !entry.name.startsWith(".")) {
			updates += generateRecursive(sassDir, path.join(dirPath, entry.name), force, log);
		}
	}
	if (generateIndexFile(sassDir, dirPath, force, log)) updates++;
	return updates;
}

/** SCSS ディレクトリを再帰走査して _index.scss を自動生成 */
export default {
	name: "sass-glob",
	deps: [],
	// 生成パーシャルは無視（自身が書く _index 等で再トリガしないように）
	watch: (ctx) => ({
		paths: [ctx.paths.assets.css],
		match: /\.(scss|sass)$/,
		ignore: /\/(_index|_tailwind|_icons|_breakpoints)\.scss$/,
	}),

	async run(ctx) {
		runSassGlob(ctx, true);
	},

	// dev: scss の add/unlink 時のみ _index 再生成（change はファイル増減なしなので何もしない）
	async incremental(ctx, opts) {
		if (opts?.event === "change") return;
		runSassGlob(ctx, false);
	},
};

function runSassGlob(ctx, force) {
	const sassDir = ctx.paths.assets.css;
	const directories = ctx.config.sassGlob?.directories ?? [
		"global",
		"components",
		"layouts",
		"pages",
	];

	ctx.log.info(`SASS glob: Processing [${directories.join(", ")}]`);

	let updates = 0;
	for (const dir of directories) {
		updates += generateRecursive(sassDir, dir, force, ctx.log);
	}

	if (updates > 0) {
		ctx.log.success("SASS glob index files updated");
	} else {
		ctx.log.info("SASS glob: No changes detected");
	}
}
