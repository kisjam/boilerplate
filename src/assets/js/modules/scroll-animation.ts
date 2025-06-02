import { u } from "./utility";
import { rafThrottle } from "./throttle";

interface ScrollAnimationOptions {
	selector: string;
	fireClass: string;
	fireRange: number;
}

export default class ScrollAnimation {
	private option: ScrollAnimationOptions;
	private observer: IntersectionObserver | null = null;
	private scrollHandlers: Map<HTMLElement, () => void> = new Map();

	constructor(customOption?: Partial<ScrollAnimationOptions>) {
		const defaultOption: ScrollAnimationOptions = {
			selector: ".js-sa",
			fireClass: "-run",
			fireRange: 0.8,
		};

		this.option = { ...defaultOption, ...customOption };

		document.addEventListener("DOMContentLoaded", () => {
			this.init();
		});
	}

	private init(): void {
		const elems = document.querySelectorAll<HTMLElement>(this.option.selector);

		if (elems.length === 0) return;

		// Use Intersection Observer if available
		if ('IntersectionObserver' in window) {
			this.initIntersectionObserver(elems);
		} else {
			// Fallback to scroll event
			elems.forEach((elem) => {
				this.registerScrollHandler(elem);
			});
		}
	}

	private initIntersectionObserver(elems: NodeListOf<HTMLElement>): void {
		const observerOptions: IntersectionObserverInit = {
			rootMargin: `0px 0px -${(1 - this.option.fireRange) * 100}% 0px`,
			threshold: 0
		};

		this.observer = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					entry.target.classList.add(this.option.fireClass);
					this.observer?.unobserve(entry.target);
				}
			});
		}, observerOptions);

		elems.forEach(elem => {
			this.observer?.observe(elem);
		});
	}

	private registerScrollHandler(elem: HTMLElement): void {
		const handler = rafThrottle(() => {
			const targetPosY = elem.getBoundingClientRect().top;

			if (u.wy + u.wh * this.option.fireRange > targetPosY + u.wy) {
				elem.classList.add(this.option.fireClass);
				window.removeEventListener("scroll", handler);
				this.scrollHandlers.delete(elem);
			}
		});

		this.scrollHandlers.set(elem, handler);
		window.addEventListener("scroll", handler);
		// Initial check
		handler();
	}

	destroy(): void {
		if (this.observer) {
			this.observer.disconnect();
			this.observer = null;
		}

		this.scrollHandlers.forEach((handler) => {
			window.removeEventListener("scroll", handler);
		});
		this.scrollHandlers.clear();
	}
}
