#!/usr/bin/env node
import { rmSync } from "node:fs";
import config from "../../build.config.js";

try {
	rmSync(config.dist, { recursive: true, force: true });
	console.log(`✓ Cleaned ${config.dist} directory`);
} catch (error) {
	console.error(`Failed to clean ${config.dist}:`, error.message);
	process.exit(1);
}
