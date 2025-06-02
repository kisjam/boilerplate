import { rafThrottle } from "./throttle";
import { u } from "./utility";

interface CheckScrolledOptions {
	selector: string;
	fireClass: string;
	fireRange: number;
}

export default class CheckScrolled {
	private option: CheckScrolledOptions;
	private scrollHandler: (() => void) | null = null;
	private element: HTMLElement | null = null;

	constructor(customOption?: Partial<CheckScrolledOptions>) {
		const defaultOption: CheckScrolledOptions = {
			selector: "body",
			fireClass: "-scrolled",
			fireRange: 100,
		};

		this.option = { ...defaultOption, ...customOption };

		document.addEventListener("DOMContentLoaded", () => {
			this.init();
		});
	}

	private init(): void {
		this.element = document.querySelector<HTMLElement>(this.option.selector);

		if (!this.element) {
			console.warn(`Element not found: ${this.option.selector}`);
			return;
		}

		this.scrollHandler = rafThrottle(() => {
			if (!this.element) return;

			if (u.wy < this.option.fireRange) {
				this.element.classList.remove(this.option.fireClass);
			} else {
				this.element.classList.add(this.option.fireClass);
			}
		});

		window.addEventListener("scroll", this.scrollHandler);
		// 初回チェック
		this.scrollHandler();
	}

	destroy(): void {
		if (this.scrollHandler) {
			window.removeEventListener("scroll", this.scrollHandler);
			this.scrollHandler = null;
		}
	}
}
