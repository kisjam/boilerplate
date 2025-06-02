// Build configuration
module.exports = {
	src: "src",
	dist: "dist",
	assets: {
		html: "src/assets/html",
		css: "src/assets/sass",
		js: "src/assets/js",
		images: "src/assets/images",
	},
	public: "src/public",
	// sass-glob設定
	sassGlob: {
		// 自動的に_index.scssを生成するディレクトリ
		directories: ["global", "components", "layouts", "pages"],
		// 除外するディレクトリ（手動管理）
		exclude: ["foundation"],
	},
};
