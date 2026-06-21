import path from "node:path";
import { pathToFileURL } from "node:url";
import tailwindcss from "@tailwindcss/postcss";
import autoprefixer from "autoprefixer";
import { Liquid } from "liquidjs";
import postcss from "postcss";
import defaultConfig from "../../build.config.js";
import { logger } from "../utils.js";

/**
 * ビルドコンテキスト。全タスクは config を直接 import せず ctx 経由で受け取る
 * （テストで src/dist や config を差し替えられるようにするため）。
 *
 * @param {{ config?: object, root?: string }} [overrides]
 */
export async function createContext(overrides = {}) {
	const config = { ...defaultConfig, ...overrides.config };
	const root = overrides.root ?? process.cwd();
	const abs = (p) => path.resolve(root, p);
	const distBase = abs(path.join(config.dist, config.basePath || ""));

	const paths = {
		root,
		src: abs(config.src),
		dist: abs(config.dist),
		distBase,
		assets: {
			html: abs(config.assets.html),
			css: abs(config.assets.css),
			js: abs(config.assets.js),
			images: abs(config.assets.images),
			icons: abs(config.assets.icons),
		},
		public: abs(config.public),
		output: {
			css: path.join(distBase, config.output.css),
			js: path.join(distBase, config.output.js),
			images: path.join(distBase, config.output.images),
			icons: path.join(distBase, config.output.icons),
		},
	};

	const tokensPath = abs(config.designTokens ?? "design-tokens.js");
	const tokens = (await import(pathToFileURL(tokensPath).href)).default;

	// 共有エンジンは遅延生成して使い回す（dev セッション中は一度だけロード）
	let cssProcessor;
	let tailwindProcessor;
	let liquid;

	const engines = {
		cssProcessor() {
			cssProcessor ??= postcss([autoprefixer({ cascade: false, grid: false })]);
			return cssProcessor;
		},
		tailwindProcessor() {
			tailwindProcessor ??= postcss([tailwindcss, autoprefixer({ cascade: false, grid: false })]);
			return tailwindProcessor;
		},
		liquid() {
			if (!liquid) {
				liquid = new Liquid({
					root: [paths.assets.html, path.join(paths.assets.html, "_components")],
					extname: ".liquid",
					cache: false,
				});
				liquid.registerFilter("parse_json", (input) => {
					try {
						return JSON.parse(input);
					} catch (error) {
						logger.error(`JSON parse error: ${error.message}`);
						return null;
					}
				});
			}
			return liquid;
		},
	};

	return { config, root, paths, tokens, tokensPath, engines, log: logger };
}
