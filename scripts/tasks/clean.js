#!/usr/bin/env node
import { rmSync } from "node:fs";
import config from "../../build.config.js";
import { logger } from "../utils.js";

try {
	rmSync(config.dist, { recursive: true, force: true });
	logger.success(`Cleaned ${config.dist} directory`);
} catch (error) {
	logger.error(`Failed to clean ${config.dist}: ${error.message}`);
	process.exit(1);
}
