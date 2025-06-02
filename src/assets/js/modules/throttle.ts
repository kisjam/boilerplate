// biome-ignore lint/suspicious/noExplicitAny: Generic function type requires flexible parameter types
export function throttle<T extends (...args: any[]) => any>(
	func: T,
	wait: number,
): (...args: Parameters<T>) => void {
	let timeout: number | null = null;
	let lastCallTime = 0;

	// biome-ignore lint/suspicious/noExplicitAny: Function context type needs to be flexible
	return function (this: any, ...args: Parameters<T>) {
		const now = Date.now();
		const remaining = wait - (now - lastCallTime);

		if (remaining <= 0 || remaining > wait) {
			if (timeout) {
				window.clearTimeout(timeout);
				timeout = null;
			}
			lastCallTime = now;
			func.apply(this, args);
		} else if (!timeout) {
			timeout = window.setTimeout(() => {
				lastCallTime = Date.now();
				timeout = null;
				func.apply(this, args);
			}, remaining);
		}
	};
}

// biome-ignore lint/suspicious/noExplicitAny: Generic function type requires flexible parameter types
export function debounce<T extends (...args: any[]) => any>(
	func: T,
	wait: number,
	immediate = false,
): (...args: Parameters<T>) => void {
	let timeout: number | null = null;

	// biome-ignore lint/suspicious/noExplicitAny: Function context type needs to be flexible
	return function (this: any, ...args: Parameters<T>) {
		const later = () => {
			timeout = null;
			if (!immediate) func.apply(this, args);
		};

		const callNow = immediate && !timeout;
		if (timeout) window.clearTimeout(timeout);
		timeout = window.setTimeout(later, wait);

		if (callNow) func.apply(this, args);
	};
}

// biome-ignore lint/suspicious/noExplicitAny: Generic function type requires flexible parameter types
export function rafThrottle<T extends (...args: any[]) => any>(
	func: T,
): (...args: Parameters<T>) => void {
	let rafId: number | null = null;

	// biome-ignore lint/suspicious/noExplicitAny: Function context type needs to be flexible
	return function (this: any, ...args: Parameters<T>) {
		if (rafId !== null) return;

		rafId = requestAnimationFrame(() => {
			func.apply(this, args);
			rafId = null;
		});
	};
}
