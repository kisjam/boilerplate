// Build configuration
export default {
	// proxy: "http://hoge:8888/",
	src: "src",
	dist: "dist",
	// basePath: "/sub-dir", // サブディレクトリ配信時の例
	basePath: "",
	assets: {
		html: "src/assets/html",
		css: "src/assets/styles",
		js: "src/assets/scripts",
		images: "src/assets/images",
		icons: "src/assets/icons",
	},
	public: "src/public",
	output: {
		css: "assets/css",
		js: "assets/js",
		images: "assets/images",
		icons: "assets/icons",
	},
	sassGlob: {
		directories: ["global", "components", "layouts", "pages", "utilities", "sample"],
	},
	tailwind: {
		outputFile: "utilities/_tailwind.scss",
	},
	svgSprite: {
		globPattern: "**/*.svg",
	},
	sitemap: {
		exclude: ["sample/**"],
	},
};
