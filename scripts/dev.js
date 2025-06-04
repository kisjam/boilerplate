#!/usr/bin/env node
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import chokidar from "chokidar";
import config from "../build.config.js";
import { startServer } from "./tasks/serve.js";

// Get the directory of this script
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

console.log("🚀 Starting development environment...");

// 初回ビルド
console.log("📦 Initial build...");
const buildChild = spawn("node scripts/build.js", {
	shell: true,
	stdio: "inherit",
});

buildChild.on("exit", async (code) => {
	if (code !== 0) {
		console.error("❌ Initial build failed");
		process.exit(code);
	}

	console.log("✅ Initial build completed");

	// BrowserSyncを統合されたserve.jsから起動
	try {
		await startServer();
	} catch (_err) {
		console.error("❌ Failed to start development server");
		process.exit(1);
	}

	console.log("👀 Watching for changes...");

	// ファイル監視設定
	console.log("📁 Watching paths:");
	const cssPath = path.resolve(projectRoot, config.assets.css);
	const jsPath = path.resolve(projectRoot, config.assets.js);
	const htmlPath = path.resolve(projectRoot, config.assets.html);
	const imagesPath = path.resolve(projectRoot, config.assets.images);
	const publicPath = path.resolve(projectRoot, config.public);

	console.log(`   CSS: ${cssPath} (*.scss, *.sass)`);
	console.log(`   JS: ${jsPath} (*.ts, *.js)`);
	console.log(`   HTML: ${htmlPath} (*.liquid)`);
	console.log(`   Images: ${imagesPath}`);
	console.log(`   Static: ${publicPath}`);

	const watchers = [
		// CSS監視 - chokidar v4では直接ディレクトリを監視
		chokidar
			.watch(cssPath, {
				ignored: (filePath, stats) => {
					// ディレクトリは無視しない
					if (stats?.isDirectory()) return false;
					// _index.scssファイルは無視（sass-globが生成）
					if (filePath.includes("_index.scss")) return true;
					// .scss/.sass以外のファイルを無視
					return !filePath.endsWith(".scss") && !filePath.endsWith(".sass");
				},
				ignoreInitial: true,
				persistent: true,
				usePolling: true,
				interval: 100,
				binaryInterval: 300,
			})
			.on("change", (filePath) => {
				console.log(`🎨 CSS changed: ${filePath}`);
				runTask("node scripts/tasks/build-css.js");
			})
			.on("add", (filePath) => {
				console.log(`📝 CSS added: ${filePath}`);
				runTask("node scripts/tasks/build-css.js");
			})
			.on("unlink", (filePath) => {
				console.log(`🗑️ CSS deleted: ${filePath}`);
				runTask("node scripts/tasks/build-css.js");
			})
			.on("error", (error) => console.error(`❌ CSS watcher error: ${error}`))
			.on("ready", () => console.log("✅ CSS watcher ready")),

		// JS監視
		chokidar
			.watch(jsPath, {
				ignored: (filePath, stats) => {
					if (stats?.isDirectory()) return false;
					return !filePath.endsWith(".ts") && !filePath.endsWith(".js");
				},
				ignoreInitial: true,
				awaitWriteFinish: {
					stabilityThreshold: 100,
					pollInterval: 100,
				},
			})
			.on("change", (filePath) => {
				console.log(`📜 JS changed: ${filePath}`);
				runTask("node scripts/tasks/build-js.js");
			})
			.on("add", (filePath) => {
				console.log(`📝 JS added: ${filePath}`);
				runTask("node scripts/tasks/build-js.js");
			})
			.on("unlink", (filePath) => {
				console.log(`🗑️ JS deleted: ${filePath}`);
				runTask("node scripts/tasks/build-js.js");
			})
			.on("ready", () => console.log("✅ JS watcher ready")),

		// HTML監視
		chokidar
			.watch(htmlPath, {
				ignored: (filePath, stats) => {
					if (stats?.isDirectory()) return false;
					return !filePath.endsWith(".liquid");
				},
				ignoreInitial: true,
				awaitWriteFinish: {
					stabilityThreshold: 100,
					pollInterval: 100,
				},
			})
			.on("change", (filePath) => {
				console.log(`📄 HTML changed: ${filePath}`);
				runTask("node scripts/tasks/build-html.js");
			})
			.on("add", (filePath) => {
				console.log(`📝 HTML added: ${filePath}`);
				runTask("node scripts/tasks/build-html.js");
			})
			.on("unlink", (filePath) => {
				console.log(`🗑️ HTML deleted: ${filePath}`);
				runTask("node scripts/tasks/build-html.js");
			})
			.on("ready", () => console.log("✅ HTML watcher ready")),

		// 画像監視
		chokidar
			.watch(imagesPath, {
				ignoreInitial: true,
				awaitWriteFinish: {
					stabilityThreshold: 100,
					pollInterval: 100,
				},
			})
			.on("change", (filePath) => {
				console.log(`🖼️ Image changed: ${filePath}`);
				runTask("node scripts/tasks/build-images.js");
			})
			.on("add", (filePath) => {
				console.log(`📝 Image added: ${filePath}`);
				runTask("node scripts/tasks/build-images.js");
				runTask("node scripts/tasks/build-images-webp.js");
			})
			.on("unlink", (filePath) => {
				console.log(`🗑️ Image deleted: ${filePath}`);
				// 削除時は対応するWebPファイルも削除する必要がある
				const webpPath = filePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
				console.log(`🔄 Checking for WebP: ${webpPath}`);
				runTask("node scripts/tasks/build-images.js");
			})
			.on("ready", () => console.log("✅ Image watcher ready")),

		// 静的ファイル監視
		chokidar
			.watch(publicPath, {
				ignoreInitial: true,
				awaitWriteFinish: {
					stabilityThreshold: 100,
					pollInterval: 100,
				},
			})
			.on("change", (filePath) => {
				console.log(`📁 Static file changed: ${filePath}`);
				runTask("node scripts/tasks/build-copy.js");
			})
			.on("add", (filePath) => {
				console.log(`📝 Static file added: ${filePath}`);
				runTask("node scripts/tasks/build-copy.js");
			})
			.on("unlink", (filePath) => {
				console.log(`🗑️ Static file deleted: ${filePath}`);
				runTask("node scripts/tasks/build-copy.js");
			})
			.on("ready", () => console.log("✅ Static file watcher ready")),
	];

	// Ctrl+C で終了
	process.on("SIGINT", () => {
		console.log("\nShutting down...");
		watchers.forEach((watcher) => watcher.close());
		process.exit(0);
	});
});

function runTask(command) {
	console.log(`🔄 ${command}`);
	const child = spawn(command, { shell: true, stdio: "inherit" });

	child.on("exit", (code) => {
		if (code === 0) {
			console.log("✅ Task completed");
		} else {
			console.error(`❌ Task failed: ${command}`);
		}
	});
}
