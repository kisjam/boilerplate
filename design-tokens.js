// デザイントークン - breakpoints/spacing の単一ソース
// breakpoints はコンテンツ側の最大幅(px)。mq(md) は width <= 768px、min 指定時は width >= 769px になる
export default {
	breakpoints: {
		"2xl": 1536,
		xl: 1280,
		lg: 1024,
		md: 768,
		sm: 640,
	},
	spacing: 1, // Tailwind の --spacing 単位(px)
};
