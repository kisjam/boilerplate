#!/usr/bin/env node
import { spawn } from "node:child_process";
import bs from "browser-sync";
import chokidar from "chokidar";
import config from "../build.config.js";

const browserSync = bs.create();

console.log("🚀 Starting development environment...");

// 初回ビルド
console.log("📦 Initial build...");
const buildChild = spawn("node scripts/build.js", {
	shell: true,
	stdio: "inherit",
});

buildChild.on("exit", (code) => {
	if (code !== 0) {
		console.error("❌ Initial build failed");
		process.exit(code);
	}

	console.log("✅ Initial build completed");

	// BrowserSync起動
	browserSync.init({
		server: {
			baseDir: config.dist,
		},
		files: [`${config.dist}/**/*`],
		open: false,
		notify: false,
		logPrefix: "Dev",
	});

	console.log("👀 Watching for changes...");

	// ファイル監視設定
	console.log("📁 Watching paths:");
	console.log(`   CSS: ${config.assets.css}/**/*.scss`);
	console.log(`   JS: ${config.assets.js}/**/*.ts`);
	console.log(`   HTML: ${config.assets.html}/**/*.liquid`);
	console.log(`   Images: ${config.assets.images}/**/*`);
	console.log(`   Static: ${config.public}/**/*`);

	const watchers = [
		// CSS監視
		chokidar
			.watch(`${config.assets.css}/**/*.scss`, {
				ignored: "**/_index.scss",
				ignoreInitial: true,
				persistent: true,
				usePolling: false,
				awaitWriteFinish: {
					stabilityThreshold: 100,
					pollInterval: 100
				}
			})
			.on("change", (path) => {
				console.log(`🎨 CSS changed: ${path}`);
				runTask("node scripts/tasks/build-css.js");
			})
			.on("add", (path) => console.log(`📝 CSS added: ${path}`))
			.on("unlink", (path) => console.log(`🗑️ CSS deleted: ${path}`))
			.on("error", (error) => console.error(`❌ CSS watcher error: ${error}`))
			.on("ready", () => console.log("✅ CSS watcher ready")),

		// JS監視
		chokidar
			.watch(`${config.assets.js}/**/*.ts`, { 
				ignoreInitial: true,
				awaitWriteFinish: {
					stabilityThreshold: 100,
					pollInterval: 100
				}
			})
			.on("change", (path) => {
				console.log(`📜 JS changed: ${path}`);
				runTask("node scripts/tasks/build-js.js");
			})
			.on("ready", () => console.log("✅ JS watcher ready")),

		// HTML監視
		chokidar
			.watch(`${config.assets.html}/**/*.liquid`, { 
				ignoreInitial: true,
				awaitWriteFinish: {
					stabilityThreshold: 100,
					pollInterval: 100
				}
			})
			.on("change", (path) => {
				console.log(`📄 HTML changed: ${path}`);
				runTask("node scripts/tasks/build-html.js");
			})
			.on("ready", () => console.log("✅ HTML watcher ready")),

		// 画像監視
		chokidar
			.watch(`${config.assets.images}/**/*`, { 
				ignoreInitial: true,
				awaitWriteFinish: {
					stabilityThreshold: 100,
					pollInterval: 100
				}
			})
			.on("change", (path) => {
				console.log(`🖼️ Image changed: ${path}`);
				runTask("node scripts/tasks/build-images.js");
			})
			.on("ready", () => console.log("✅ Image watcher ready")),

		// 静的ファイル監視
		chokidar
			.watch(`${config.public}/**/*`, { 
				ignoreInitial: true,
				awaitWriteFinish: {
					stabilityThreshold: 100,
					pollInterval: 100
				}
			})
			.on("change", (path) => {
				console.log(`📁 Static file changed: ${path}`);
				runTask("node scripts/tasks/build-copy.js");
			})
			.on("ready", () => console.log("✅ Static file watcher ready")),
	];

	// Ctrl+C で終了
	process.on("SIGINT", () => {
		console.log("\nShutting down...");
		watchers.forEach((watcher) => watcher.close());
		browserSync.exit();
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