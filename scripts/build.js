#!/usr/bin/env node
import { parseArgs } from "./core/args.js";
import { createContext } from "./core/context.js";
import { runTasks } from "./core/runner.js";
import { buildTasks, clean } from "./registry.js";

const { prod } = parseArgs(process.argv);
const ctx = await createContext();

ctx.log.info(`Building project${prod ? " (production)" : ""}...`);

try {
	await clean.run(ctx);
	await runTasks(buildTasks, ctx, { prod });
	ctx.log.success("Build completed successfully!");
} catch (error) {
	ctx.log.error(`Build failed: ${error.message}`);
	process.exit(1);
}
