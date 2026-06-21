#!/usr/bin/env node
import { parseArgs } from "./core/args.js";
import { createContext } from "./core/context.js";
import { allTasks } from "./registry.js";

// 単体タスク実行（デバッグ・npm scripts 用）: node scripts/cli.js <task> [--prod]
const taskName = process.argv[2];
const task = allTasks.find((t) => t.name === taskName);

if (!task) {
	const names = allTasks.map((t) => t.name).join(", ");
	console.error(`Unknown task "${taskName}". Available: ${names}`);
	process.exit(1);
}

const { prod } = parseArgs(process.argv.slice(1));
const ctx = await createContext();

try {
	await task.run(ctx, { prod });
} catch (error) {
	ctx.log.error(`Task "${taskName}" failed: ${error.message}`);
	process.exit(1);
}
