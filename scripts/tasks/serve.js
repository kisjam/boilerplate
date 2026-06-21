import bs from "browser-sync";
import { createContext } from "../core/context.js";

const browserSync = bs.create();

/**
 * BrowserSync 開発サーバーを起動
 * @param {any} ctx
 * @param {object} [customOptions]
 */
export function startServer(ctx, customOptions = {}) {
	const { config, log } = ctx;
	const finalOptions = {
		...(config.proxy ? { proxy: config.proxy } : { server: { baseDir: config.dist } }),
		...(config.basePath ? { startPath: config.basePath } : {}),
		files: [`${config.dist}/**/*`],
		open: customOptions.open ?? "external",
		notify: false,
		logPrefix: customOptions.logPrefix ?? "Dev",
		...customOptions,
	};

	return new Promise((resolve, reject) => {
		browserSync.init(finalOptions, (err, instance) => {
			if (err) {
				log.error(`BrowserSync failed to start: ${err}`);
				reject(err);
			} else {
				log.success("Development server started");
				resolve(instance);
			}
		});
	});
}

// CLI 実行（npm run serve）
if (import.meta.url === `file://${process.argv[1]}`) {
	const ctx = await createContext();
	startServer(ctx).catch(() => process.exit(1));
}
