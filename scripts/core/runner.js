/**
 * タスクの依存グラフ実行（in-process オーケストレーター）
 *
 * 各タスクは `deps` を await してから本体を実行するため、依存を満たしつつ最大限並列化される。
 * メモ（running）は**呼び出しごとにローカル**。dev で同じタスクを毎イベント再実行できるよう、
 * 実行インスタンスをまたいで使い回さない。
 *
 * @typedef {Object} Task
 * @property {string} name
 * @property {string[]} [deps]
 * @property {(ctx: any, opts: any) => Promise<void>|void} run
 * @property {(ctx: any, opts: any) => Promise<void>|void} [incremental]
 */

/**
 * @param {Task[]} allTasks - 依存解決に使う全タスク（name で参照）
 * @param {any} ctx
 * @param {{ incremental?: boolean }} [opts]
 * @param {Task[]} [only] - 実際に起点として走らせるサブセット（既定: 全部）。deps は自動で巻き込む。
 */
export async function runTasks(allTasks, ctx, opts = {}, only = allTasks) {
	const byName = new Map(allTasks.map((t) => [t.name, t]));
	const running = new Map();
	const useIncremental = opts.incremental === true;

	function run(task) {
		const existing = running.get(task.name);
		if (existing) return existing;

		const promise = (async () => {
			await Promise.all(
				(task.deps ?? []).map((depName) => {
					const dep = byName.get(depName);
					if (!dep) {
						throw new Error(`Unknown dependency "${depName}" of task "${task.name}"`);
					}
					return run(dep);
				}),
			);
			const fn = (useIncremental && task.incremental) || task.run;
			return fn(ctx, opts);
		})();

		running.set(task.name, promise);
		return promise;
	}

	await Promise.all(only.map(run));
}

/**
 * dev のインクリメンタル実行。変更タスク＋その依存先を DAG 順で走らせる。
 * - 直接変更されたタスク: 単一ファイルなら incremental(event,path)、複数 or incremental 無しは run
 * - 依存先（直接変更でない）: run でフル再実行
 * @param {Task[]} allTasks
 * @param {any} ctx
 * @param {Map<string, {event: string, paths: Set<string>}>} changedMap
 */
export async function runIncremental(allTasks, ctx, changedMap) {
	const affected = collectDependents(allTasks, new Set(changedMap.keys()));
	const byName = new Map(allTasks.map((t) => [t.name, t]));
	const running = new Map();

	function run(task) {
		const existing = running.get(task.name);
		if (existing) return existing;

		const promise = (async () => {
			await Promise.all(
				(task.deps ?? []).filter((d) => affected.has(d)).map((d) => run(byName.get(d))),
			);

			const changed = changedMap.get(task.name);
			if (changed) {
				const paths = [...changed.paths];
				if (task.incremental && paths.length === 1) {
					return task.incremental(ctx, { event: changed.event, path: paths[0] });
				}
				return task.run(ctx, {});
			}
			return task.run(ctx, {});
		})();

		running.set(task.name, promise);
		return promise;
	}

	await Promise.all([...affected].filter((n) => byName.has(n)).map((n) => run(byName.get(n))));
}

/**
 * あるタスク集合に依存している（直接・間接の）全タスクを返す。
 * dev ディスパッチャが「変更タスク＋その依存先」を算出するのに使う。
 * @param {Task[]} allTasks
 * @param {Set<string>} changedNames
 * @returns {Set<string>} changedNames を含む、影響を受けるタスク名の集合
 */
export function collectDependents(allTasks, changedNames) {
	const affected = new Set(changedNames);
	let grew = true;
	while (grew) {
		grew = false;
		for (const task of allTasks) {
			if (affected.has(task.name)) continue;
			if ((task.deps ?? []).some((d) => affected.has(d))) {
				affected.add(task.name);
				grew = true;
			}
		}
	}
	return affected;
}
