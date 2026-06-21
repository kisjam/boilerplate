import assert from "node:assert/strict";
import { test } from "node:test";
import { collectDependents, runIncremental, runTasks } from "../scripts/core/runner.js";

/** 実行順を記録するタスクを作る */
function recorder() {
	const order = [];
	const make = (name, deps = [], extra = {}) => ({
		name,
		deps,
		run: async () => {
			order.push(name);
		},
		...extra,
	});
	return { order, make };
}

test("依存タスクが依存元より先に完了する", async () => {
	const { order, make } = recorder();
	const tasks = [make("css", ["tokens", "sass-glob"]), make("tokens"), make("sass-glob")];
	await runTasks(tasks, {}, {});
	assert.ok(order.indexOf("tokens") < order.indexOf("css"));
	assert.ok(order.indexOf("sass-glob") < order.indexOf("css"));
});

test("独立タスクは並列に走る（両方が完了前に開始）", async () => {
	let started = 0;
	let bothStarted = false;
	const gate = (name) => ({
		name,
		deps: [],
		run: async () => {
			started++;
			if (started === 2) bothStarted = true;
			await new Promise((r) => setTimeout(r, 10));
		},
	});
	await runTasks([gate("a"), gate("b")], {}, {});
	assert.equal(bothStarted, true, "2つが同時に進行していない");
});

test("共有依存は1回だけ実行（同一invocation）", async () => {
	const counts = {};
	const t = (name, deps = []) => ({
		name,
		deps,
		run: async () => {
			counts[name] = (counts[name] ?? 0) + 1;
		},
	});
	const tasks = [t("base"), t("x", ["base"]), t("y", ["base"]), t("z", ["x", "y"])];
	await runTasks(tasks, {}, {});
	assert.equal(counts.base, 1, "base が複数回走った");
});

test("メモは invocation ごと（2回呼べば2回走る）", async () => {
	const { order, make } = recorder();
	const tasks = [make("a")];
	await runTasks(tasks, {}, {});
	await runTasks(tasks, {}, {});
	assert.deepEqual(order, ["a", "a"]);
});

test("未知の依存で throw", async () => {
	const { make } = recorder();
	await assert.rejects(
		() => runTasks([make("css", ["missing"])], {}, {}),
		/Unknown dependency "missing"/,
	);
});

test("only サブセット: 起点＋依存のみ走り、無関係は走らない", async () => {
	const { order, make } = recorder();
	const all = [make("css", ["tokens"]), make("tokens"), make("html", ["images"]), make("images")];
	const only = [all[0]]; // css のみ起点
	await runTasks(all, {}, {}, only);
	assert.deepEqual(order.sort(), ["css", "tokens"]);
	assert.ok(!order.includes("html"));
	assert.ok(!order.includes("images"));
});

test("incremental: true なら incremental を優先、無ければ run にフォールバック", async () => {
	const calls = [];
	const tasks = [
		{
			name: "withInc",
			deps: [],
			run: () => calls.push("withInc:run"),
			incremental: () => calls.push("withInc:inc"),
		},
		{ name: "noInc", deps: [], run: () => calls.push("noInc:run") },
	];
	await runTasks(tasks, {}, { incremental: true });
	assert.ok(calls.includes("withInc:inc"));
	assert.ok(calls.includes("noInc:run"));
	assert.ok(!calls.includes("withInc:run"));
});

test("collectDependents: 変更タスクの依存元を再帰収集", () => {
	const all = [
		{ name: "tokens", deps: [] },
		{ name: "tailwind", deps: [] },
		{ name: "sass-glob", deps: [] },
		{ name: "css", deps: ["tokens", "tailwind", "sass-glob"] },
		{ name: "html", deps: ["images"] },
		{ name: "images", deps: [] },
	];
	// sass-glob が変わったら css も影響を受ける
	const affected = collectDependents(all, new Set(["sass-glob"]));
	assert.ok(affected.has("sass-glob"));
	assert.ok(affected.has("css"));
	assert.ok(!affected.has("html"));
	assert.ok(!affected.has("tokens"));
});

test("collectDependents: images 変更で html を巻き込む", () => {
	const all = [
		{ name: "html", deps: ["images"] },
		{ name: "images", deps: [] },
	];
	const affected = collectDependents(all, new Set(["images"]));
	assert.deepEqual([...affected].sort(), ["html", "images"]);
});

// --- runIncremental（dev ディスパッチャの中核） ---

function devTasks(log) {
	return [
		{
			name: "sass-glob",
			deps: [],
			run: () => log.push("sass-glob:run"),
			incremental: (_c, o) => log.push(`sass-glob:inc:${o.event}`),
		},
		{ name: "tokens", deps: [], run: () => log.push("tokens:run") },
		{ name: "css", deps: ["tokens", "sass-glob"], run: () => log.push("css:run") },
		{
			name: "images",
			deps: [],
			run: () => log.push("images:run"),
			incremental: (_c, o) => log.push(`images:inc:${o.path}`),
		},
		{
			name: "html",
			deps: ["images"],
			run: () => log.push("html:run"),
			incremental: (_c, o) => log.push(`html:inc:${o.path}`),
		},
	];
}

test("runIncremental: scss追加 → sass-glob(inc) の後に css(run)", async () => {
	const log = [];
	const all = devTasks(log);
	await runIncremental(
		all,
		{},
		new Map([["sass-glob", { event: "add", paths: new Set(["a.scss"]) }]]),
	);
	assert.ok(log.includes("sass-glob:inc:add"));
	assert.ok(log.includes("css:run"));
	assert.ok(log.indexOf("sass-glob:inc:add") < log.indexOf("css:run"), "sass-glob が css より先");
	assert.ok(!log.includes("tokens:run"), "無関係な tokens は走らない");
});

test("runIncremental: 単一ファイルは incremental(path) を呼ぶ", async () => {
	const log = [];
	const all = devTasks(log);
	await runIncremental(
		all,
		{},
		new Map([["images", { event: "change", paths: new Set(["/x/cat.png"]) }]]),
	);
	assert.ok(log.includes("images:inc:/x/cat.png"));
	// images 変更 → 依存 html もフル再実行
	assert.ok(log.includes("html:run"));
});

test("runIncremental: 複数ファイルは incremental でなく run", async () => {
	const log = [];
	const all = devTasks(log);
	await runIncremental(
		all,
		{},
		new Map([["images", { event: "change", paths: new Set(["/a.png", "/b.png"]) }]]),
	);
	assert.ok(log.includes("images:run"));
	assert.ok(!log.some((l) => l.startsWith("images:inc")));
});

test("runIncremental: change イベントの sass-glob は依存 css を巻き込む", async () => {
	const log = [];
	const all = devTasks(log);
	await runIncremental(
		all,
		{},
		new Map([["sass-glob", { event: "change", paths: new Set(["a.scss"]) }]]),
	);
	assert.ok(log.includes("sass-glob:inc:change"));
	assert.ok(log.includes("css:run"));
});
