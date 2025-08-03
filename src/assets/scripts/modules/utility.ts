/**
 * ユーティリティ関数とクラスの定義
 * ウィンドウ情報、DOM操作、アニメーション機能を提供
 */

// 定数定義
const BREAKPOINT_DESKTOP = 1024;
const SCROLL_HEADER_HEIGHT_DESKTOP = 120;
const SCROLL_HEADER_HEIGHT_MOBILE = 80;
const ANIMATION_DURATION_DEFAULT = 600;

// 型定義
interface SlideOptions {
	duration?: number;
	onComplete?: () => void;
}

/**
 * ウィンドウ情報とメディアクエリを管理するユーティリティクラス
 */
class Utility {
	private readonly breakpoint: string;
	private readonly mq: MediaQueryList;
	private cachedScrollbarWidth: number | null = null;

	constructor() {
		this.breakpoint = `(max-width: ${BREAKPOINT_DESKTOP}px)`;
		this.mq = window.matchMedia(this.breakpoint);
	}

	/**
	 * ウィンドウ幅を取得
	 */
	get ww(): number {
		return window.innerWidth;
	}

	/**
	 * ウィンドウ高さを取得
	 */
	get wh(): number {
		return window.innerHeight;
	}

	/**
	 * スクロール位置を取得（pageYOffsetの代わりにscrollYを使用）
	 */
	get wy(): number {
		return window.scrollY;
	}

	/**
	 * ヘッダー高さを考慮したスクロールギャップを取得
	 */
	get scrollGap(): number {
		return this.ww > BREAKPOINT_DESKTOP
			? -SCROLL_HEADER_HEIGHT_DESKTOP
			: -SCROLL_HEADER_HEIGHT_MOBILE;
	}

	/**
	 * デスクトップ判定
	 */
	get isDesktop(): boolean {
		return this.ww > BREAKPOINT_DESKTOP;
	}

	/**
	 * メディアクエリの状態を取得
	 */
	get mediaQueryMatches(): boolean {
		return this.mq.matches;
	}

	/**
	 * スクロールバー幅を取得（キャッシュあり）
	 */
	getScrollbarWidth(): number {
		if (this.cachedScrollbarWidth === null) {
			this.cachedScrollbarWidth =
				window.innerWidth - document.documentElement.clientWidth;
		}
		return this.cachedScrollbarWidth;
	}

	/**
	 * スクロールバー幅のキャッシュをクリア
	 */
	clearScrollbarWidthCache(): void {
		this.cachedScrollbarWidth = null;
	}
}

// シングルトンインスタンス
export const u = new Utility();

/**
 * スクロールバー幅をCSS変数として設定
 */
export const addScrollbarWidth = (): void => {
	let rafId: number | null = null;

	const updateScrollbarWidth = (): void => {
		if (rafId !== null) {
			cancelAnimationFrame(rafId);
		}

		rafId = requestAnimationFrame(() => {
			const scrollbarWidth = u.getScrollbarWidth();
			document.documentElement.style.setProperty(
				"--scrollbar",
				`${scrollbarWidth}px`
			);
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
		{ once: true }
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
 * 要素をスライドアップ（非表示）
 */
export const slideUp = (
	element: HTMLElement,
	options: SlideOptions = {}
): void => {
	const { duration = ANIMATION_DURATION_DEFAULT, onComplete } = options;

	// 既に非表示の場合は何もしない
	if (element.style.display === "none") {
		onComplete?.();
		return;
	}

	// 現在の高さを取得して設定
	const height = element.offsetHeight;
	element.style.height = `${height}px`;
	element.offsetHeight; // リフローを強制

	// トランジション設定
	element.style.overflow = "hidden";
	element.style.transitionProperty = "height, margin, padding";
	element.style.transitionDuration = `${duration}ms`;
	element.style.transitionTimingFunction = "ease-out";

	// 値を0に設定
	requestAnimationFrame(() => {
		element.style.height = "0";
		element.style.paddingTop = "0";
		element.style.paddingBottom = "0";
		element.style.marginTop = "0";
		element.style.marginBottom = "0";
	});

	// トランジション終了処理
	const handleTransitionEnd = (e: TransitionEvent): void => {
		if (e.target !== element || e.propertyName !== "height") return;

		element.style.display = "none";
		cleanupStyles(element);
		element.removeEventListener("transitionend", handleTransitionEnd);
		onComplete?.();
	};

	element.addEventListener("transitionend", handleTransitionEnd);

	// タイムアウト処理（トランジションが発火しない場合の保険）
	setTimeout(() => {
		if (element.style.display !== "none") {
			element.style.display = "none";
			cleanupStyles(element);
			element.removeEventListener("transitionend", handleTransitionEnd);
			onComplete?.();
		}
	}, duration + 50);
};

/**
 * 要素をスライドダウン（表示）
 */
export const slideDown = (
	element: HTMLElement,
	options: SlideOptions = {}
): void => {
	const { duration = ANIMATION_DURATION_DEFAULT, onComplete } = options;

	// 既に表示されている場合は何もしない
	if (element.style.display !== "none" && element.offsetHeight > 0) {
		onComplete?.();
		return;
	}

	// display設定
	element.style.removeProperty("display");
	let display = window.getComputedStyle(element).display;
	if (display === "none") display = "block";
	element.style.display = display;

	// 目標の高さを取得
	const height = element.offsetHeight;

	// 初期状態を設定
	element.style.overflow = "hidden";
	element.style.height = "0";
	element.style.paddingTop = "0";
	element.style.paddingBottom = "0";
	element.style.marginTop = "0";
	element.style.marginBottom = "0";
	element.offsetHeight; // リフローを強制

	// トランジション設定
	element.style.transitionProperty = "height, margin, padding";
	element.style.transitionDuration = `${duration}ms`;
	element.style.transitionTimingFunction = "ease-out";

	// 値を設定
	requestAnimationFrame(() => {
		element.style.height = `${height}px`;
		element.style.removeProperty("padding-top");
		element.style.removeProperty("padding-bottom");
		element.style.removeProperty("margin-top");
		element.style.removeProperty("margin-bottom");
	});

	// トランジション終了処理
	const handleTransitionEnd = (e: TransitionEvent): void => {
		if (e.target !== element || e.propertyName !== "height") return;

		cleanupStyles(element);
		element.removeEventListener("transitionend", handleTransitionEnd);
		onComplete?.();
	};

	element.addEventListener("transitionend", handleTransitionEnd);

	// タイムアウト処理（トランジションが発火しない場合の保険）
	setTimeout(() => {
		cleanupStyles(element);
		element.removeEventListener("transitionend", handleTransitionEnd);
		onComplete?.();
	}, duration + 50);
};

/**
 * スタイルのクリーンアップ
 */
const cleanupStyles = (element: HTMLElement): void => {
	element.style.removeProperty("height");
	element.style.removeProperty("padding-top");
	element.style.removeProperty("padding-bottom");
	element.style.removeProperty("margin-top");
	element.style.removeProperty("margin-bottom");
	element.style.removeProperty("overflow");
	element.style.removeProperty("transition-duration");
	element.style.removeProperty("transition-property");
	element.style.removeProperty("transition-timing-function");
};

/**
 * デバウンス関数
 */
export const debounce = <T extends (...args: unknown[]) => void>(
	func: T,
	wait: number
): ((...args: Parameters<T>) => void) => {
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	return (...args: Parameters<T>): void => {
		if (timeoutId !== null) {
			clearTimeout(timeoutId);
		}

		timeoutId = setTimeout(() => {
			func(...args);
			timeoutId = null;
		}, wait);
	};
};

/**
 * スロットル関数
 */
export const throttle = <T extends (...args: unknown[]) => void>(
	func: T,
	limit: number
): ((...args: Parameters<T>) => void) => {
	let inThrottle = false;

	return (...args: Parameters<T>): void => {
		if (!inThrottle) {
			func(...args);
			inThrottle = true;
			setTimeout(() => {
				inThrottle = false;
			}, limit);
		}
	};
};

/**
 * スクロール時にis-scrolledクラスを管理
 */
export const addScrolledClass = (): void => {
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
