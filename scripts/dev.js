#!/usr/bin/env node
import { spawn } from "node:child_process";
import bs from "browser-sync";
import chokidar from "chokidar";
import config from "../build.config.js";

const browserSync = bs.create();

console.log("🚀 Starting development environment...");

// 初回ビルド
console.log("📦 Initial build...");
const buildChild = spawn("node scripts/build.js", { shell: true, stdio: "inherit" });

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

	// ファイル監視
	const watchers = [
		// CSS監視
		chokidar
			.watch(`${config.assets.css}/**/*.scss`, { ignored: "**/_index.scss" })
			.on("change", () => runTask("node scripts/tasks/build-css.js")),

		// JS監視
		chokidar
			.watch(`${config.assets.js}/**/*.ts`)
			.on("change", () => runTask("node scripts/tasks/build-js.js")),

		// HTML監視
		chokidar
			.watch(`${config.assets.html}/**/*.liquid`)
			.on("change", () => runTask("node scripts/tasks/build-html.js")),

		// 画像監視
		chokidar
			.watch(`${config.assets.images}/**/*`)
			.on("change", () => runTask("node scripts/tasks/build-images.js")),

		// 静的ファイル監視
		chokidar
			.watch(`${config.public}/**/*`)
			.on("change", () => runTask("node scripts/tasks/build-copy.js")),
	];

	// Ctrl+C で終了
	process.on("SIGINT", () => {
		console.log("\n🛑 Shutting down...");
		watchers.forEach((watcher) => watcher.close());
		browserSync.exit();
		process.exit(0);
	});
});

function runTask(command) {
	console.log(`🔄 ${command}`);
	const child = spawn(command, { shell: true, stdio: "pipe" });

	child.on("exit", (code) => {
		if (code === 0) {
			console.log("✅ Task completed");
		} else {
			console.error(`❌ Task failed: ${command}`);
		}
	});
}
