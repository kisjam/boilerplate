// Build configuration
export default {
	src: "src",
	dist: "dist",
	assets: {
		html: "src/assets/html",
		css: "src/assets/styles",
		js: "src/assets/scripts",
		images: "src/assets/images",
	},
	public: "src/public",
	// sass-glob設定
	sassGlob: {
		// 自動的に_index.scssを生成するディレクトリ
		// Note: foundationは手動管理のため含めない
		directories: ["global", "components", "layouts", "pages", "utilities"],
	},
};
