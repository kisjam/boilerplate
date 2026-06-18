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

	// ブラウザ任せのスクロール復元を切り、自前で位置を制御する
	if ("scrollRestoration" in history) {
		history.scrollRestoration = "manual";
	}

	const scrollToTarget = (): void => {
		let target: HTMLElement | null = null;
		try {
			target = document.querySelector<HTMLElement>(hash);
		} catch {
			// 不正なセレクタ（CSS.escape が必要なハッシュ等）は対象外
			return;
		}
		if (target === null) return;

		// smooth はロード時のレイアウト変動とレースするため auto で確実に飛ばす
		target.scrollIntoView({ behavior: "auto", block: "start" });

		// フォーカスもアンカーへ移す（キーボード／スクリーンリーダー対応）
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
