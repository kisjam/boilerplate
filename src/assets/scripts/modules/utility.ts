/**
 * ウィンドウ情報とメディアクエリを管理するユーティリティ
 */

const BREAKPOINT_DESKTOP = 1024;
const SCROLL_HEADER_HEIGHT_DESKTOP = 120;
const SCROLL_HEADER_HEIGHT_MOBILE = 80;

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
			this.cachedScrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
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

export const u = new Utility();
