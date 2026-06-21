/**
 * DOM 構築済みなら即実行、まだなら DOMContentLoaded を待って実行する。
 * コンストラクタ内で `document.addEventListener("DOMContentLoaded", ...)` を直接書くと、
 * 既に発火済みのタイミングで生成した場合に二度と実行されない。それを防ぐための共通ヘルパ。
 */
export function onReady(callback: () => void): void {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", callback, { once: true });
	} else {
		callback();
	}
}
