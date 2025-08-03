import fs from "node:fs";
import path from "node:path";
import config from "../../build.config.js";
import { logger } from "../utils.js";

const sassDir = config.assets.css;

const directories = config.sassGlob?.directories || ["global", "components", "layouts", "pages"];

const forceUpdate = process.argv.includes("--force");

function generateIndexFile(dirPath) {
	const fullPath = path.join(sassDir, dirPath);

	if (!fs.existsSync(fullPath)) {
		return;
	}

	const entries = fs.readdirSync(fullPath, { withFileTypes: true });

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
		.map((file) => `@forward "${file}";`);

	const subDirs = entries
		.filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
		.filter((entry) => {
			const indexPath = path.join(fullPath, entry.name, "_index.scss");
			return fs.existsSync(indexPath);
		})
		.map((entry) => entry.name)
		.sort()
		.map((dir) => `@forward "${dir}/_index.scss";`);

	const allImports = [...scssFiles, ...subDirs].join("\n");

	const indexPath = path.join(fullPath, "_index.scss");
	const content = allImports
		? `// [AUTO-GENERATED] This file is managed by sass-glob.js\n\n${allImports}\n`
		: `// [AUTO-GENERATED] This file is managed by sass-glob.js\n`;

	let needsUpdate = forceUpdate;
	if (!forceUpdate && fs.existsSync(indexPath)) {
		const existingContent = fs.readFileSync(indexPath, "utf8");
		needsUpdate = existingContent !== content;
	} else if (!fs.existsSync(indexPath)) {
		needsUpdate = true;
	}

	if (needsUpdate) {
		fs.writeFileSync(indexPath, content);
		const fileCount = scssFiles.length;
		const dirCount = subDirs.length;
		logger.success(
			`Generated: ${path.relative(".", indexPath)} (${fileCount} files, ${dirCount} directories)`,
		);
	}
}

function generateIndexFileRecursive(dirPath) {
	const fullPath = path.join(sassDir, dirPath);

	if (!fs.existsSync(fullPath)) {
		return;
	}

	const entries = fs.readdirSync(fullPath, { withFileTypes: true });
	entries.forEach((entry) => {
		if (entry.isDirectory() && !entry.name.startsWith(".")) {
			const subDirPath = path.join(dirPath, entry.name);
			generateIndexFileRecursive(subDirPath);
		}
	});

	generateIndexFile(dirPath);
}

let hasUpdates = false;

const originalLog = console.log;
console.log = (...args) => {
	if (args[0]?.startsWith("Generated:")) {
		hasUpdates = true;
	}
	originalLog.apply(console, args);
};

logger.info(`SASS glob: Processing [${directories.join(", ")}]`);

directories.forEach((dir) => {
	generateIndexFileRecursive(dir);
});

console.log = originalLog;

if (hasUpdates) {
	logger.success("SASS glob index files updated");
} else {
	logger.info("SASS glob: No changes detected");
}
