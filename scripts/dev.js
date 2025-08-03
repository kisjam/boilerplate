#!/usr/bin/env node
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import chokidar from "chokidar";
import config from "../build.config.js";
import { startServer } from "./tasks/serve.js";
import { logger } from "./utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

/**
 * @param {string} command
 */
function runTask(command) {
	const child = spawn(command, { shell: true, stdio: "inherit" });

	child.on("exit", (code) => {
		if (code !== 0) {
			logger.error(`Task failed: ${command}`);
		}
	});
}

/**
 * @param {string} watchPath
 * @param {object} options
 * @param {object} handlers
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

console.log("🚀 Starting development environment...");

console.log("📦 Initial build...");
const buildChild = spawn("node scripts/build.js", {
	shell: true,
	stdio: "inherit",
});

buildChild.on("exit", async (code) => {
	if (code !== 0) {
		logger.error("Initial build failed - continuing with development server");
	} else {
		logger.success("Initial build completed");
	}

	try {
		await startServer();
	} catch (_err) {
		logger.error("Failed to start development server");
		process.exit(1);
	}

	console.log("👀 Watching for changes...");

	const paths = {
		css: path.resolve(projectRoot, config.assets.css),
		js: path.resolve(projectRoot, config.assets.js),
		html: path.resolve(projectRoot, config.assets.html),
		images: path.resolve(projectRoot, config.assets.images),
		icons: path.resolve(projectRoot, config.assets.icons),
		public: path.resolve(projectRoot, config.public),
	};

	const watchers = [
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
					logger.info(`CSS: Changed ${path.basename(filePath)}`);
					runTask("node scripts/tasks/build-css.js");
				},
				add: (_filePath) => {
					runTask("node scripts/tasks/sass-glob.js");
					runTask("node scripts/tasks/build-css.js");
				},
				unlink: (_filePath) => {
					runTask("node scripts/tasks/sass-glob.js");
					runTask("node scripts/tasks/build-css.js");
				},
				error: (error) => logger.error(`CSS watcher error: ${error}`),
				ready: () =>
					logger.success(`CSS watcher ready: ${paths.css} (*.scss, *.sass)`),
			}
		),

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
				change: (_filePath) => {
					runTask("node scripts/tasks/build-js.js");
					runTask("node scripts/tasks/build-tailwind.js");
				},
				add: (_filePath) => {
					runTask("node scripts/tasks/build-js.js");
					runTask("node scripts/tasks/build-tailwind.js");
				},
				unlink: (_filePath) => {
					runTask("node scripts/tasks/build-js.js");
				},
				ready: () =>
					logger.success(`JS watcher ready: ${paths.js} (*.ts, *.js)`),
			}
		),

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
					const relativePath = path.relative(paths.html, filePath);
					const isShared =
						relativePath.startsWith("_components/") ||
						relativePath.startsWith("_layouts/") ||
						relativePath.startsWith("_config/");

					if (isShared) {
						runTask("node scripts/tasks/build-html.js");
					} else {
						runTask(`node scripts/tasks/build-html.js --single ${filePath}`);
					}
					runTask("node scripts/tasks/build-tailwind.js");
				},
				add: (filePath) => {
					const relativePath = path.relative(paths.html, filePath);
					const isShared =
						relativePath.startsWith("_components/") ||
						relativePath.startsWith("_layouts/");

					if (isShared) {
						runTask("node scripts/tasks/build-html.js");
					} else {
						runTask(`node scripts/tasks/build-html.js --single ${filePath}`);
					}
					runTask("node scripts/tasks/build-tailwind.js");
				},
				unlink: (_filePath) => {
					runTask("node scripts/tasks/build-html.js");
				},
				ready: () => {
					logger.success(`HTML watcher ready: ${paths.html} (*.liquid)`);
				},
			}
		),

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
					runTask(`node scripts/tasks/build-images.js --single "${filePath}"`);
					if (/\.(jpg|jpeg|png)$/i.test(filePath)) {
						runTask(
							`node scripts/tasks/build-images-webp.js --single "${filePath}"`
						);
					}
				},
				add: (filePath) => {
					runTask(`node scripts/tasks/build-images.js --single "${filePath}"`);
					if (/\.(jpg|jpeg|png)$/i.test(filePath)) {
						runTask(
							`node scripts/tasks/build-images-webp.js --single "${filePath}"`
						);
					}
				},
				unlink: (_filePath) => {
					runTask("node scripts/tasks/build-images.js");
				},
				ready: () => logger.success(`Image watcher ready: ${paths.images}`),
			}
		),

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
				change: (_filePath) => {
					runTask("node scripts/tasks/build-copy.js");
				},
				add: (_filePath) => {
					runTask("node scripts/tasks/build-copy.js");
				},
				unlink: (_filePath) => {
					runTask("node scripts/tasks/build-copy.js");
				},
				ready: () =>
					logger.success(`Static file watcher ready: ${paths.public}`),
			}
		),

		createWatcher(
			paths.icons,
			{
				ignored: (path, stats) => stats?.isFile() && !path.endsWith(".svg"),
				usePolling: true,
				interval: 100,
				binaryInterval: 300,
				awaitWriteFinish: {
					stabilityThreshold: 100,
					pollInterval: 100,
				},
			},
			{
				change: (_filePath) => {
					runTask("node scripts/tasks/build-svg-sprite.js");
				},
				add: (_filePath) => {
					runTask("node scripts/tasks/build-svg-sprite.js");
				},
				unlink: (_filePath) => {
					runTask("node scripts/tasks/build-svg-sprite.js");
				},
				ready: () =>
					logger.success(`Icon watcher ready: ${paths.icons} (*.svg)`),
			}
		),
	];

	process.on("SIGINT", () => {
		logger.info("\n🍺 Shutting down...");
		watchers.forEach((watcher) => watcher.close());
		process.exit(0);
	});
});
