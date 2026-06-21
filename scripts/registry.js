import clean from "./tasks/clean.js";
import copy from "./tasks/copy.js";
import css from "./tasks/css.js";
import html from "./tasks/html.js";
import images from "./tasks/images.js";
import js from "./tasks/js.js";
import sassGlob from "./tasks/sass-glob.js";
import svgSprite from "./tasks/svg-sprite.js";
import tailwind from "./tasks/tailwind.js";
import tokens from "./tasks/tokens.js";
import webp from "./tasks/webp.js";

/** clean を除く全ビルドタスク（runner が deps を解決して並列実行） */
export const buildTasks = [
	tokens,
	tailwind,
	svgSprite,
	sassGlob,
	css,
	js,
	copy,
	images,
	webp,
	html,
];

/** clean を含む全タスク（cli の単体実行用） */
export const allTasks = [clean, ...buildTasks];

export { clean };
