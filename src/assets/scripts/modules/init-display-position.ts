/**
 * URLハッシュ付きでページを開いた（リロード／別ページからの遷移）とき、
 * アンカー位置へスクロールする。
 *
 * 画像などの遅延コンテンツでレイアウトが確定する前にスクロールすると位置がズレるため、
 * load 完了後に requestAnimationFrame で1フレーム待ってから実行する。
 * ヘッダー分のオフセットは CSS の `scroll-margin-top`（[id]）に委ねる。
 */
export const init = (): void => {
	const { hash } = window.location;
	if (!hash) return;

	if ("scrollRestoration" in history) {
		history.scrollRestoration = "manual";
	}

	const scrollToTarget = (): void => {
		let target: HTMLElement | null = null;
		try {
			target = document.querySelector<HTMLElement>(hash);
		} catch {
			return;
		}
		if (target === null) return;

		target.scrollIntoView({ behavior: "auto", block: "start" });

		target.setAttribute("tabindex", "-1");
		target.focus({ preventScroll: true });
	};

	window.addEventListener(
		"load",
		() => {
			requestAnimationFrame(scrollToTarget);
		},
		{ once: true },
	);
};
