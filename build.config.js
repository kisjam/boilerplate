// Build configuration
export default {
	src: "src",
	dist: "dist",
	basePath: "",
	// basePath: "/lp",
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
		directories: ["global", "components", "layouts", "pages", "utilities"],
	},
	tailwind: {
		outputFile: "utilities/_tailwind.scss",
	},
	svgSprite: {
		globPattern: "**/*.svg",
	},
};
