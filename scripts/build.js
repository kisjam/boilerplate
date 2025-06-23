#!/usr/bin/env node
import { spawn } from "node:child_process";

// 引数で本番ビルドを制御
const args = process.argv.slice(2);
const isProd = args.includes("--prod");

console.log(`Building project${isProd ? " (production)" : ""}...`);

// まずクリーンアップを実行
const cleanCommand = "node scripts/tasks/clean.js";
console.log(`\n1. Cleaning: ${cleanCommand}`);
const cleanChild = spawn(cleanCommand, { shell: true, stdio: "inherit" });

cleanChild.on("exit", async (code) => {
	if (code !== 0) {
		console.error("Clean failed");
		process.exit(code);
	}

	// sass-globを実行（初回は強制更新）
	console.log("\n2. Running sass-glob...");
	const sassGlobChild = spawn("node scripts/tasks/sass-glob.js --force", { shell: true, stdio: "inherit" });

	sassGlobChild.on("exit", async (sassGlobCode) => {
		if (sassGlobCode !== 0) {
			console.error("sass-glob failed");
			process.exit(sassGlobCode);
		}

		// ビルドタスクを並列実行
		const tasks = [
			"node scripts/tasks/build-copy.js",
			`node scripts/tasks/build-js.js${isProd ? " --prod" : ""}`,
			`node scripts/tasks/build-css.js${isProd ? " --prod" : ""}`,
			"node scripts/tasks/build-tailwind.js",
			"node scripts/tasks/build-images.js",
			"node scripts/tasks/build-images-webp.js",
			"node scripts/tasks/build-svg-sprite.js",
			"node scripts/tasks/build-html.js",
		];

		console.log("\n3. Building assets in parallel...");

		const buildPromises = tasks.map((task, index) => {
			console.log(`   ${index + 1}. ${task}`);
			return new Promise((resolve, reject) => {
				const child = spawn(task, { shell: true, stdio: "inherit" });
				child.on("exit", (code) => {
					if (code === 0) {
						resolve();
					} else {
						reject(new Error(`Task failed: ${task}`));
					}
				});
			});
		});

		try {
			await Promise.all(buildPromises);
			console.log("\n✓ Build completed successfully!");
			process.exit(0);
		} catch (error) {
			console.error("\n❌ Build failed:", error.message);
			process.exit(1);
		}
	});
});
