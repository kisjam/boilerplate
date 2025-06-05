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

// ================================
// Helper Functions
// ================================

/**
 * タスクを実行する
 * @param {string} command - 実行するコマンド
 */
function runTask(command) {
	console.log(`🔄 ${command}`);
	const child = spawn(command, { shell: true, stdio: "inherit" });

	child.on("exit", (code) => {
		if (code === 0) {
			console.log("✓ Task completed");
		} else {
			console.error(`❌ Task failed: ${command}`);
		}
	});
}

/**
 * ファイル監視の設定を作成
 * @param {string} watchPath - 監視するパス
 * @param {object} options - chokidarのオプション
 * @param {object} handlers - イベントハンドラー
 * @returns {chokidar.FSWatcher}
 */
function createWatcher(watchPath, options, handlers) {
	const watcher = chokidar.watch(watchPath, {
		ignoreInitial: true,
		...options,
	});

	if (handlers.change) watcher.on("change", handlers.change);
	if (handlers.add) watcher.on("add", handlers.add);
	if (handlers.unlink) watcher.on("unlink", handlers.unlink);
	if (handlers.error) watcher.on("error", handlers.error);
	if (handlers.ready) watcher.on("ready", handlers.ready);

	return watcher;
}

// ================================
// Main Process
// ================================

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

	console.log("✓ Initial build completed");

	// BrowserSyncを統合されたserve.jsから起動
	try {
		await startServer();
	} catch (_err) {
		console.error("❌ Failed to start development server");
		process.exit(1);
	}

	console.log("👀 Watching for changes...");

	// ================================
	// Watch Configuration
	// ================================

	// パスの設定
	const paths = {
		css: path.resolve(projectRoot, config.assets.css),
		js: path.resolve(projectRoot, config.assets.js),
		html: path.resolve(projectRoot, config.assets.html),
		images: path.resolve(projectRoot, config.assets.images),
		public: path.resolve(projectRoot, config.public),
	};

	console.log("📁 Watching paths:");
	console.log(`   CSS: ${paths.css} (*.scss, *.sass)`);
	console.log(`   JS: ${paths.js} (*.ts, *.js)`);
	console.log(`   HTML: ${paths.html} (*.liquid)`);
	console.log(`   Images: ${paths.images}`);
	console.log(`   Static: ${paths.public}`);

	const watchers = [
		// CSS監視 - chokidar v4では直接ディレクトリを監視
		createWatcher(
			paths.css,
			{
				ignored: (path, stats) => stats?.isFile() && !path.endsWith(".scss"),
				persistent: true,
				usePolling: true,
				interval: 100,
				binaryInterval: 300,
			},
			{
				change: (filePath) => {
					console.log(`🎨 CSS changed: ${filePath}`);
					runTask("node scripts/tasks/build-css.js");
				},
				add: (filePath) => {
					console.log(`📝 CSS added: ${filePath}`);
					runTask("node scripts/tasks/build-css.js");
				},
				unlink: (filePath) => {
					console.log(`🗑️ CSS deleted: ${filePath}`);
					runTask("node scripts/tasks/build-css.js");
				},
				error: (error) => console.error(`❌ CSS watcher error: ${error}`),
				ready: () => console.log("✓ CSS watcher ready"),
			}
		),

		// JS監視
		createWatcher(
			paths.js,
			{
				ignored: (path, stats) =>
					stats?.isFile() && !path.endsWith(".js") && !path.endsWith(".ts"),
				usePolling: true,
				interval: 100,
				binaryInterval: 300,
				awaitWriteFinish: {
					stabilityThreshold: 100,
					pollInterval: 100,
				},
			},
			{
				change: (filePath) => {
					console.log(`📜 JS changed: ${filePath}`);
					runTask("node scripts/tasks/build-js.js");
				},
				add: (filePath) => {
					console.log(`📝 JS added: ${filePath}`);
					runTask("node scripts/tasks/build-js.js");
				},
				unlink: (filePath) => {
					console.log(`🗑️ JS deleted: ${filePath}`);
					runTask("node scripts/tasks/build-js.js");
				},
				ready: () => console.log("✓ JS watcher ready"),
			}
		),

		// HTML監視
		createWatcher(
			paths.html,
			{
				ignored: (path, stats) => stats?.isFile() && !path.endsWith(".liquid"),
				usePolling: true,
				interval: 100,
				binaryInterval: 300,
				awaitWriteFinish: {
					stabilityThreshold: 100,
					pollInterval: 100,
				},
			},
			{
				change: (filePath) => {
					console.log(`📄 HTML changed: ${filePath}`);
					runTask("node scripts/tasks/build-html.js");
				},
				add: (filePath) => {
					console.log(`📝 HTML added: ${filePath}`);
					runTask("node scripts/tasks/build-html.js");
				},
				unlink: (filePath) => {
					console.log(`🗑️ HTML deleted: ${filePath}`);
					runTask("node scripts/tasks/build-html.js");
				},
				ready: () => {
					console.log("✓ HTML watcher ready");
					console.log(`   Watching: ${paths.html} for *.liquid files`);
				},
			}
		),

		// 画像監視
		createWatcher(
			paths.images,
			{
				usePolling: true,
				interval: 100,
				binaryInterval: 300,
				awaitWriteFinish: {
					stabilityThreshold: 100,
					pollInterval: 100,
				},
			},
			{
				change: (filePath) => {
					console.log(`🖼️ Image changed: ${filePath}`);
					runTask("node scripts/tasks/build-images.js");
				},
				add: (filePath) => {
					console.log(`📝 Image added: ${filePath}`);
					runTask("node scripts/tasks/build-images.js");
					// JPG/PNG の場合は WebP 変換も実行
					if (/\.(jpg|jpeg|png)$/i.test(filePath)) {
						runTask("node scripts/tasks/build-images-webp.js");
					}
				},
				unlink: (filePath) => {
					console.log(`🗑️ Image deleted: ${filePath}`);
					runTask("node scripts/tasks/build-images.js");
				},
				ready: () => console.log("✓ Image watcher ready"),
			}
		),

		// 静的ファイル監視
		createWatcher(
			paths.public,
			{
				usePolling: true,
				interval: 100,
				binaryInterval: 300,
				awaitWriteFinish: {
					stabilityThreshold: 100,
					pollInterval: 100,
				},
			},
			{
				change: (filePath) => {
					console.log(`📁 Static file changed: ${filePath}`);
					runTask("node scripts/tasks/build-copy.js");
				},
				add: (filePath) => {
					console.log(`📝 Static file added: ${filePath}`);
					runTask("node scripts/tasks/build-copy.js");
				},
				unlink: (filePath) => {
					console.log(`🗑️ Static file deleted: ${filePath}`);
					runTask("node scripts/tasks/build-copy.js");
				},
				ready: () => console.log("✓ Static file watcher ready"),
			}
		),
	];

	// Ctrl+C で終了
	process.on("SIGINT", () => {
		console.log("\n🍺 Shutting down...");
		watchers.forEach((watcher) => watcher.close());
		process.exit(0);
	});
});
