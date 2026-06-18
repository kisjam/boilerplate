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

	updateScrollbarWidth();

	window.addEventListener("resize", handleResize, { passive: true });

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
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				document.body.classList.add("is-loaded");
			});
		});
	};

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

	const mobileRegex =
		/iphone|ipad|ipod|android|mobile|blackberry|iemobile|kindle|silk|opera mini|opera mobi|tablet|webos|windows phone|phone/i;

	const isMobile = mobileRegex.test(ua) || "ontouchstart" in window;

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

	handleScroll();

	const throttledScroll = throttle(handleScroll, 16);
	window.addEventListener("scroll", throttledScroll, { passive: true });
};
