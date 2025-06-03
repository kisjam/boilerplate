#!/usr/bin/env node
import bs from "browser-sync";
import config from "../../build.config.js";

const browserSync = bs.create();

// コマンドライン引数の処理
const args = process.argv.slice(2);
const _options = {
	open: args.includes("--no-open") ? false : "external",
	// dev.jsから呼ばれる場合は、BrowserSyncインスタンスを返す
	returnInstance: args.includes("--return-instance"),
};

// APIとして使える形に変更
export function startServer(customOptions = {}) {
	const finalOptions = {
		server: {
			baseDir: config.dist,
		},
		files: [`${config.dist}/**/*`],
		open: customOptions.open ?? "external",
		notify: false,
		logPrefix: customOptions.logPrefix ?? "Dev",
		...customOptions,
	};

	return new Promise((resolve, reject) => {
		browserSync.init(finalOptions, (err, bs) => {
			if (err) {
				console.error("BrowserSync failed to start:", err);
				reject(err);
			} else {
				console.log("✓ Development server started");
				resolve(bs);
			}
		});
	});
}

// CLIとして直接実行された場合
if (import.meta.url === `file://${process.argv[1]}`) {
	startServer().catch(() => process.exit(1));
}

export default browserSync;
