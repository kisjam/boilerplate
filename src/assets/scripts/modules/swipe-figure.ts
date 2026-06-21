interface Option {
	selector: string;
	scrolledClass: string;
}

interface CustomOption {
	selector?: string;
	scrolledClass?: string;
}

export default class SwipeFigure {
	option: Option;

	constructor(customOption?: CustomOption) {
		const defaultOption: Option = {
			selector: ".js-swipe",
			scrolledClass: "-scrolled",
		};

		this.option = { ...defaultOption, ...customOption };

		document.addEventListener("DOMContentLoaded", () => {
			const elems = document.querySelectorAll<HTMLElement>(this.option.selector);

			elems.forEach((elem) => {
				this.registerEventHandler(elem);
			});
		});
	}
	registerEventHandler(elem: HTMLElement) {
		elem.classList.add("swipe");

		const scrollEvent = () => {
			elem.removeEventListener("scroll", scrollEvent);
			elem.classList.add(this.option.scrolledClass);
		};

		elem.addEventListener("scroll", scrollEvent);
	}
}
