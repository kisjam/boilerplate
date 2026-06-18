/**
 * タイミング制御ユーティリティ
 * throttle / debounce / rafThrottle を提供
 */

/**
 * スロットル関数（trailing-edge 対応）
 */
export function throttle<T extends (...args: unknown[]) => void>(
	func: T,
	wait: number,
): (...args: Parameters<T>) => void {
	let timeout: number | null = null;
	let lastCallTime = 0;

	return (...args: Parameters<T>): void => {
		const now = Date.now();
		const remaining = wait - (now - lastCallTime);

		if (remaining <= 0 || remaining > wait) {
			if (timeout) {
				window.clearTimeout(timeout);
				timeout = null;
			}
			lastCallTime = now;
			func(...args);
		} else if (!timeout) {
			timeout = window.setTimeout(() => {
				lastCallTime = Date.now();
				timeout = null;
				func(...args);
			}, remaining);
		}
	};
}

/**
 * デバウンス関数
 */
export function debounce<T extends (...args: unknown[]) => void>(
	func: T,
	wait: number,
	immediate = false,
): (...args: Parameters<T>) => void {
	let timeout: number | null = null;

	return (...args: Parameters<T>): void => {
		const later = () => {
			timeout = null;
			if (!immediate) func(...args);
		};

		const callNow = immediate && !timeout;
		if (timeout) window.clearTimeout(timeout);
		timeout = window.setTimeout(later, wait);

		if (callNow) func(...args);
	};
}

/**
 * requestAnimationFrame ベースのスロットル
 */
export function rafThrottle<T extends (...args: unknown[]) => void>(
	func: T,
): (...args: Parameters<T>) => void {
	let rafId: number | null = null;

	return (...args: Parameters<T>): void => {
		if (rafId !== null) return;

		rafId = requestAnimationFrame(() => {
			func(...args);
			rafId = null;
		});
	};
}
