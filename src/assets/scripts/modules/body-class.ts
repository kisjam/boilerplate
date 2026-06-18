/**
 * body / html へのクラス・CSS変数の初期化
 */

import { throttle } from "./throttle";
import { u } from "./utility";

/**
 * スクロールバー幅をCSS変数として設定
 */
export const initScrollbarWidth = (): void => {
	let rafId: number | null = null;

	const updateScrollbarWidth = (): void => {
		if (rafId !== null) {
			cancelAnimationFrame(rafId);
		}

		rafId = requestAnimationFrame(() => {
			const scrollbarWidth = u.getScrollbarWidth();
			document.documentElement.style.setProperty("--scrollbar", `${scrollbarWidth}px`);
			rafId = null;
		});
	};

	const handleResize = (): void => {
		u.clearScrollbarWidthCache();
		updateScrollbarWidth();
	};

	// 初期設定
	updateScrollbarWidth();

	// イベントリスナー設定（重複防止のため一度だけ登録）
	window.addEventListener("resize", handleResize, { passive: true });

	// loadイベントは一度だけ実行
	window.addEventListener(
		"load",
		() => {
			updateScrollbarWidth();
		},
		{ once: true },
	);
};

/**
 * DOM読み込み完了後にis-loadedクラスを追加
 */
export const addLoadedClass = (): void => {
	const addLoadedClassToBody = (): void => {
		// 2フレーム後に実行（より滑らかなアニメーションのため）
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				document.body.classList.add("is-loaded");
			});
		});
	};

	// DOMContentLoadedか既に読み込み済みかチェック
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", addLoadedClassToBody, {
			once: true,
		});
	} else {
		addLoadedClassToBody();
	}
};

/**
 * デバイスタイプに応じてクラスを追加
 */
export const addDeviceClass = (): void => {
	const ua = navigator.userAgent.toLowerCase();

	// より正確なモバイル検出正規表現
	const mobileRegex =
		/iphone|ipad|ipod|android|mobile|blackberry|iemobile|kindle|silk|opera mini|opera mobi|tablet|webos|windows phone|phone/i;

	const isMobile = mobileRegex.test(ua) || "ontouchstart" in window;

	// クラスを追加
	const className = isMobile ? "is-mobile" : "is-laptop";
	document.body.classList.add(className);
};

/**
 * 上スクロール時にis-scroll-upクラスを管理
 */
export const initScrollDirectionClass = (): void => {
	let lastScrollY = window.scrollY;
	let isScrollUp = false;

	const handleScroll = (): void => {
		const currentScroll = window.scrollY;
		const shouldBeScrollUp = currentScroll < lastScrollY;
		lastScrollY = currentScroll;

		if (shouldBeScrollUp !== isScrollUp) {
			isScrollUp = shouldBeScrollUp;

			if (isScrollUp) {
				document.body.classList.add("is-scroll-up");
				document.body.classList.remove("is-scroll-down");
			} else {
				document.body.classList.remove("is-scroll-up");
				document.body.classList.add("is-scroll-down");
			}
		}
	};

	const throttledScroll = throttle(handleScroll, 16);
	window.addEventListener("scroll", throttledScroll, { passive: true });
};

/**
 * スクロール時にis-scrolledクラスを管理
 */
export const initScrolledClass = (): void => {
	const SCROLL_THRESHOLD = 100;
	let isScrolled = false;

	const handleScroll = (): void => {
		const currentScroll = window.scrollY;
		const shouldBeScrolled = currentScroll > SCROLL_THRESHOLD;

		if (shouldBeScrolled !== isScrolled) {
			isScrolled = shouldBeScrolled;

			if (isScrolled) {
				document.body.classList.add("is-scrolled");
			} else {
				document.body.classList.remove("is-scrolled");
			}
		}
	};

	// 初期状態をチェック
	handleScroll();

	// スクロールイベントをスロットル処理
	const throttledScroll = throttle(handleScroll, 16); // ~60fps
	window.addEventListener("scroll", throttledScroll, { passive: true });
};
