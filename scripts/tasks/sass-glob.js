import fs from "node:fs";
import path from "node:path";
import config from "../../build.config.js";

const sassDir = config.assets.css;

// 設定ファイルからディレクトリリストを取得
const directories = config.sassGlob?.directories || ["global", "components", "layouts", "pages"];

// 強制更新フラグ（コマンドライン引数で指定）
const forceUpdate = process.argv.includes("--force");

// 同一階層の_*.scssファイルとサブディレクトリを取得してindex.scssを生成
function generateIndexFile(dirPath) {
	const fullPath = path.join(sassDir, dirPath);

	if (!fs.existsSync(fullPath)) {
		return;
	}

	const entries = fs.readdirSync(fullPath, { withFileTypes: true });

	// SCSSファイルを取得
	const scssFiles = entries
		.filter(
			(entry) =>
				entry.isFile() &&
				entry.name.startsWith("_") &&
				entry.name.endsWith(".scss") &&
				entry.name !== "_index.scss",
		)
		.map((entry) => entry.name)
		.sort()
		.map((file) => `@forward "${file.replace(".scss", "")}";`);

	// サブディレクトリで_index.scssを持つものを取得
	const subDirs = entries
		.filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
		.filter((entry) => {
			const indexPath = path.join(fullPath, entry.name, "_index.scss");
			return fs.existsSync(indexPath);
		})
		.map((entry) => entry.name)
		.sort()
		.map((dir) => `@forward "${dir}";`);

	// 両方を結合
	const allImports = [...scssFiles, ...subDirs].join("\n");

	// _index.scssファイルを生成（コンテンツが空でも更新する）
	const indexPath = path.join(fullPath, "_index.scss");
	const content = allImports 
		? `// [AUTO-GENERATED] This file is managed by sass-glob.js\n\n${allImports}\n`
		: `// [AUTO-GENERATED] This file is managed by sass-glob.js\n`;

	// 既存の内容と比較して変更がある場合のみ書き込み
	let needsUpdate = forceUpdate; // 強制更新フラグがある場合は常に更新
	if (!forceUpdate && fs.existsSync(indexPath)) {
		const existingContent = fs.readFileSync(indexPath, "utf8");
		needsUpdate = existingContent !== content;
	} else if (!fs.existsSync(indexPath)) {
		needsUpdate = true; // ファイルが存在しない場合は常に作成
	}

	if (needsUpdate) {
		fs.writeFileSync(indexPath, content);
		const fileCount = scssFiles.length;
		const dirCount = subDirs.length;
		console.log(
			`Generated: ${path.relative(".", indexPath)} (${fileCount} files, ${dirCount} directories)`,
		);
	}
}

// サブディレクトリも処理
function generateIndexFileRecursive(dirPath) {
	const fullPath = path.join(sassDir, dirPath);

	if (!fs.existsSync(fullPath)) {
		return;
	}

	// 先にサブディレクトリを処理（深い階層から）
	const entries = fs.readdirSync(fullPath, { withFileTypes: true });
	entries.forEach((entry) => {
		if (entry.isDirectory() && !entry.name.startsWith(".")) {
			const subDirPath = path.join(dirPath, entry.name);
			generateIndexFileRecursive(subDirPath);
		}
	});

	// その後で現在のディレクトリの_index.scssを生成
	generateIndexFile(dirPath);
}

let hasUpdates = false;

// 元のログ関数を保存
const originalLog = console.log;
console.log = (...args) => {
	if (args[0]?.startsWith("Generated:")) {
		hasUpdates = true;
	}
	originalLog.apply(console, args);
};

// 開始ログ
console.log(`SASS glob: Processing [${directories.join(", ")}]`);

directories.forEach((dir) => {
	generateIndexFileRecursive(dir);
});

// ログ関数を復元
console.log = originalLog;

if (hasUpdates) {
	console.log("SASS glob index files updated");
} else {
	console.log("SASS glob: No changes detected");
}
