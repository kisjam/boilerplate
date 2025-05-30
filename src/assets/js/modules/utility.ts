class Utility {
	breakpoint: string;
	mq: MediaQueryList;

	constructor() {
		this.breakpoint = "(max-width: 1024px)";
		this.mq = window.matchMedia(this.breakpoint);
	}

	get ww(): number {
		return window.innerWidth;
	}
	get wh(): number {
		return window.innerHeight;
	}
	get wy(): number {
		return window.pageYOffset;
	}
	get scrollGap(): number {
		return this.ww > 1024 ? -120 : -80;
	}
}

export const u = new Utility();

export const addScrollbarWidth = (): void => {
	const addCustomProperty = (): void => {
		const scrollbarWidth: number =
			window.innerWidth - document.documentElement.clientWidth;

		document.documentElement.style.setProperty(
			"--scrollbar",
			`${scrollbarWidth}px`
		);
	};

	window.addEventListener("load", addCustomProperty);
	window.addEventListener("resize", addCustomProperty);
	addCustomProperty();
};

export const addLoadedClass = (): void => {
	document.addEventListener("DOMContentLoaded", () => {
		window.requestAnimationFrame(() => {
			window.requestAnimationFrame(() => {
				document.body.classList.add("is-loaded");
			});
		});
	});
};

export const slideUp = (
	element: HTMLElement,
	duration: number = 600,
	onComplete?: () => void
): void => {
	element.style.height = `${element.offsetHeight}px`;
	element.offsetHeight;
	element.style.overflow = "hidden";
	element.style.transitionProperty = "height, margin, padding";
	element.style.transitionDuration = `${duration}ms`;
	element.style.height = "0";
	element.style.paddingTop = "0";
	element.style.paddingBottom = "0";
	element.style.marginTop = "0";
	element.style.marginBottom = "0";

	const slideUpCallback = (e: TransitionEvent): void => {
		if (e.target !== e.currentTarget) return;

		element.style.display = "none";
		element.style.removeProperty("height");
		element.style.removeProperty("padding-top");
		element.style.removeProperty("padding-bottom");
		element.style.removeProperty("margin-top");
		element.style.removeProperty("margin-bottom");
		element.style.removeProperty("overflow");
		element.style.removeProperty("transition-duration");
		element.style.removeProperty("transition-property");
		element.removeEventListener("transitionend", slideUpCallback);
		if (onComplete) onComplete();
	};

	element.addEventListener("transitionend", slideUpCallback);
};

export const slideDown = (
	element: HTMLElement,
	duration: number = 600,
	onComplete?: () => void
): void => {
	element.style.removeProperty("display");
	let display = window.getComputedStyle(element).display;

	if (display === "none") display = "block";

	element.style.display = display;
	let height = element.offsetHeight;
	element.style.overflow = "hidden";
	element.style.height = "0";
	element.style.paddingTop = "0";
	element.style.paddingBottom = "0";
	element.style.marginTop = "0";
	element.style.marginBottom = "0";
	element.offsetHeight;
	element.style.transitionProperty = "height, margin, padding";
	element.style.transitionDuration = `${duration}ms`;
	element.style.height = `${height}px`;

	const slideDownCallback = (e: TransitionEvent): void => {
		if (e.target !== e.currentTarget) return;

		element.style.removeProperty("height");
		element.style.removeProperty("padding-top");
		element.style.removeProperty("padding-bottom");
		element.style.removeProperty("margin-top");
		element.style.removeProperty("margin-bottom");
		element.style.removeProperty("overflow");
		element.style.removeProperty("transition-duration");
		element.style.removeProperty("transition-property");
		element.removeEventListener("transitionend", slideDownCallback);
		if (onComplete) onComplete();
	};

	element.addEventListener("transitionend", slideDownCallback);
};
