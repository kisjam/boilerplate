import { onReady } from "./dom-ready";

interface Option {
	selector: string;
	scrolledClass: string;
}

interface CustomOption {
	selector?: string;
	scrolledClass?: string;
}

export class SwipeFigure {
	option: Option;

	constructor(customOption?: CustomOption) {
		const defaultOption: Option = {
			selector: ".js-swipe",
			scrolledClass: "-scrolled",
		};

		this.option = { ...defaultOption, ...customOption };

		onReady(() => {
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

/** SwipeFigure を生成して返す。DOM 構築後に自動で対象要素へハンドラを登録する。 */
export function createSwipeFigure(customOption?: CustomOption): SwipeFigure {
	return new SwipeFigure(customOption);
}
