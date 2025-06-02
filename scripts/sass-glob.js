const fs = require("fs");
const path = require("path");
const config = require("../build.config");

const sassDir = config.assets.css;

// 設定ファイルからディレクトリリストを取得
const directories = config.sassGlob?.directories || ["global", "components", "layouts", "pages"];

// 同一階層の_*.scssファイルとサブディレクトリを取得してindex.scssを生成
function generateIndexFile(dirPath) {
	const fullPath = path.join(sassDir, dirPath);

	if (!fs.existsSync(fullPath)) {
		return;
	}

	const entries = fs.readdirSync(fullPath, { withFileTypes: true });
	
	// SCSSファイルを取得
	const scssFiles = entries
		.filter((entry) => entry.isFile() && entry.name.startsWith("_") && entry.name.endsWith(".scss") && entry.name !== "_index.scss")
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

	if (allImports) {
		const indexPath = path.join(fullPath, "_index.scss");
		const content = `// [AUTO-GENERATED] This file is managed by sass-glob.js\n\n${allImports}\n`;

		// 既存の内容と比較して変更がある場合のみ書き込み
		let needsUpdate = true;
		if (fs.existsSync(indexPath)) {
			const existingContent = fs.readFileSync(indexPath, "utf8");
			needsUpdate = existingContent !== content;
		}

		if (needsUpdate) {
			fs.writeFileSync(indexPath, content);
			const fileCount = scssFiles.length;
			const dirCount = subDirs.length;
			console.log(`Generated: ${path.relative(".", indexPath)} (${fileCount} files, ${dirCount} directories)`);
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

// 開始ログ
if (config.sassGlob?.exclude) {
	console.log(`SASS glob: Processing [${directories.join(", ")}], excluding [${config.sassGlob.exclude.join(", ")}]`);
} else {
	console.log(`SASS glob: Processing [${directories.join(", ")}]`);
}

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
