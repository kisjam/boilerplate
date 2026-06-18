/**
 * スライドアニメーション（高さ・余白のトランジション）
 */

const ANIMATION_DURATION_DEFAULT = 600;
const EASE_OUT_QUART = "cubic-bezier(0.165, 0.84, 0.44, 1)";

interface SlideOptions {
	duration?: number;
	onComplete?: () => void;
}

/**
 * スライドアニメーションの共通実装
 */
const slide = (element: HTMLElement, expand: boolean, options: SlideOptions): void => {
	const { duration = ANIMATION_DURATION_DEFAULT, onComplete } = options;

	if (expand) {
		if (element.style.display !== "none" && element.offsetHeight > 0) {
			onComplete?.();
			return;
		}

		element.style.removeProperty("display");
		let display = window.getComputedStyle(element).display;
		if (display === "none") display = "block";
		element.style.display = display;

		const height = element.offsetHeight;

		element.style.overflow = "hidden";
		element.style.height = "0";
		element.style.paddingTop = "0";
		element.style.paddingBottom = "0";
		element.style.marginTop = "0";
		element.style.marginBottom = "0";
		element.offsetHeight;

		element.style.transitionProperty = "height, margin, padding";
		element.style.transitionDuration = `${duration}ms`;
		element.style.transitionTimingFunction = EASE_OUT_QUART;

		requestAnimationFrame(() => {
			element.style.height = `${height}px`;
			element.style.removeProperty("padding-top");
			element.style.removeProperty("padding-bottom");
			element.style.removeProperty("margin-top");
			element.style.removeProperty("margin-bottom");
		});
	} else {
		if (element.style.display === "none") {
			onComplete?.();
			return;
		}

		const height = element.offsetHeight;
		element.style.height = `${height}px`;
		element.offsetHeight;

		element.style.overflow = "hidden";
		element.style.transitionProperty = "height, margin, padding";
		element.style.transitionDuration = `${duration}ms`;
		element.style.transitionTimingFunction = EASE_OUT_QUART;

		requestAnimationFrame(() => {
			element.style.height = "0";
			element.style.paddingTop = "0";
			element.style.paddingBottom = "0";
			element.style.marginTop = "0";
			element.style.marginBottom = "0";
		});
	}

	let finished = false;
	const finish = (): void => {
		if (finished) return;
		finished = true;

		element.removeEventListener("transitionend", handleTransitionEnd);
		if (!expand) {
			element.style.display = "none";
		}
		cleanupStyles(element);
		onComplete?.();
	};

	const handleTransitionEnd = (e: TransitionEvent): void => {
		if (e.target !== element || e.propertyName !== "height") return;
		finish();
	};

	element.addEventListener("transitionend", handleTransitionEnd);

	setTimeout(finish, duration + 50);
};

/**
 * 要素をスライドアップ（非表示）
 */
export const slideUp = (element: HTMLElement, options: SlideOptions = {}): void => {
	slide(element, false, options);
};

/**
 * 要素をスライドダウン（表示）
 */
export const slideDown = (element: HTMLElement, options: SlideOptions = {}): void => {
	slide(element, true, options);
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
