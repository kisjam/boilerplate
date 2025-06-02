const fs = require("fs");
const path = require("path");
const config = require("../build.config");

const sassDir = config.assets.css;

// 各ディレクトリに_index.scssファイルを生成
const directories = ["global", "components", "layouts", "pages"];
// Note: foundationは手動管理のため除外

// 同一階層の_*.scssファイルを取得してindex.scssを生成
function generateIndexFile(dirPath) {
	const fullPath = path.join(sassDir, dirPath);

	if (!fs.existsSync(fullPath)) {
		return;
	}

	const files = fs.readdirSync(fullPath);
	const scssFiles = files
		.filter((file) => file.startsWith("_") && file.endsWith(".scss") && file !== "_index.scss")
		.sort()
		.map((file) => `@forward "${file.replace(".scss", "")}";`)
		.join("\n");

	if (scssFiles) {
		const indexPath = path.join(fullPath, "_index.scss");
		const content = `${scssFiles}\n`;

		// 既存の内容と比較して変更がある場合のみ書き込み
		let needsUpdate = true;
		if (fs.existsSync(indexPath)) {
			const existingContent = fs.readFileSync(indexPath, "utf8");
			needsUpdate = existingContent !== content;
		}

		if (needsUpdate) {
			fs.writeFileSync(indexPath, content);
			const fileCount = files.filter(
				(file) => file.startsWith("_") && file.endsWith(".scss") && file !== "_index.scss",
			).length;
			console.log(`Generated: ${path.relative(".", indexPath)} (${fileCount} files)`);
		}
	}
}

// サブディレクトリも処理
function generateIndexFileRecursive(dirPath) {
	const fullPath = path.join(sassDir, dirPath);

	if (!fs.existsSync(fullPath)) {
		return;
	}

	// 現在のディレクトリの_index.scssを生成
	generateIndexFile(dirPath);

	// サブディレクトリを処理
	const entries = fs.readdirSync(fullPath, { withFileTypes: true });
	entries.forEach((entry) => {
		if (entry.isDirectory() && !entry.name.startsWith(".")) {
			const subDirPath = path.join(dirPath, entry.name);
			generateIndexFileRecursive(subDirPath);
		}
	});
}

let hasUpdates = false;

// 元のログ関数を保存
const originalLog = console.log;
console.log = (...args) => {
	if (args[0] && args[0].startsWith("Generated:")) {
		hasUpdates = true;
	}
	originalLog.apply(console, args);
};

directories.forEach((dir) => {
	generateIndexFileRecursive(dir);
});

// ログ関数を復元
console.log = originalLog;

if (hasUpdates) {
	console.log("SASS glob index files updated");
}
