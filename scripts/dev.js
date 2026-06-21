#!/usr/bin/env node
import path from "node:path";
import chokidar from "chokidar";
import { createContext } from "./core/context.js";
import { runIncremental, runTasks } from "./core/runner.js";
import { buildTasks, clean } from "./registry.js";
import { startServer } from "./tasks/serve.js";

// Dropbox 等で fsevents が不安定なため polling + awaitWriteFinish（意図的）
const WATCH_OPTIONS = {
	ignoreInitial: true,
	usePolling: true,
	interval: 100,
	binaryInterval: 300,
	awaitWriteFinish: { stabilityThreshold: 100, pollInterval: 100 },
};
const DEBOUNCE_MS = 150;

const ctx = await createContext();

console.log("🚀 Starting development environment...");
console.log("📦 Initial build...");
try {
	await clean.run(ctx);
	await runTasks(buildTasks, ctx, { prod: false });
	ctx.log.success("Initial build completed");
} catch (error) {
	ctx.log.error(`Initial build failed: ${error.message}`);
}

await startServer(ctx);
console.log("👀 Watching for changes...");

// 各タスクの watch 宣言からウォッチ仕様を組み立て（build/dev のドリフトを防ぐ単一ソース）
const specs = buildTasks
	.filter((t) => typeof t.watch === "function")
	.map((t) => ({ task: t, ...t.watch(ctx) }));

const watchPaths = [...new Set(specs.flatMap((s) => s.paths))];

/** 変更ファイルにマッチするタスク一覧 */
function matchTasks(filePath) {
	return specs
		.filter((s) => {
			const inScope = s.paths.some((p) => filePath === p || filePath.startsWith(p + path.sep));
			if (!inScope) return false;
			if (s.match?.test(filePath) === false) return false;
			if (s.ignore?.test(filePath)) return false;
			return true;
		})
		.map((s) => s.task);
}

// 単一ディスパッチャ: イベントを束ね(debounce)、影響タスクを DAG 順で再実行
let pending = new Map();
let timer = null;

function flush() {
	timer = null;
	const batch = pending;
	pending = new Map();
	if (batch.size === 0) return;
	runIncremental(buildTasks, ctx, batch).catch((error) => {
		ctx.log.error(`Rebuild failed: ${error.message}`);
	});
}

function onEvent(event, filePath) {
	const tasks = matchTasks(filePath);
	if (tasks.length === 0) return;
	for (const t of tasks) {
		const entry = pending.get(t.name) ?? { event, paths: new Set() };
		entry.event = event;
		entry.paths.add(filePath);
		pending.set(t.name, entry);
	}
	ctx.log.info(`Changed: ${path.basename(filePath)} → [${tasks.map((t) => t.name).join(", ")}]`);
	if (timer) clearTimeout(timer);
	timer = setTimeout(flush, DEBOUNCE_MS);
}

const watcher = chokidar.watch(watchPaths, WATCH_OPTIONS);
watcher.on("change", (p) => onEvent("change", p));
watcher.on("add", (p) => onEvent("add", p));
watcher.on("unlink", (p) => onEvent("unlink", p));
watcher.on("error", (error) => ctx.log.error(`Watcher error: ${error}`));
watcher.on("ready", () => ctx.log.success(`Watching ${watchPaths.length} paths`));

process.on("SIGINT", () => {
	ctx.log.info("\n🍺 Shutting down...");
	watcher.close();
	process.exit(0);
});
