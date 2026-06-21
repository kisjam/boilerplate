import { onReady } from "./dom-ready";
import { u } from "./utility";

interface Option {
	selector: string;
	ignoreSelector: string;
}
interface CustomOption {
	selector?: string;
	ignoreSelector?: string;
}

export class SmoothScroll {
	option: Option;

	constructor(customOption?: CustomOption) {
		const defaultOption: Option = {
			selector: 'a[href^="#"]:not(.js-ignore-smooth)',
			ignoreSelector: "",
		};

		this.option = { ...defaultOption, ...customOption };

		onReady(() => {
			const anchors = document.querySelectorAll<HTMLAnchorElement>(
				this.option.selector + this.option.ignoreSelector,
			);

			anchors.forEach((anchor) => {
				this.registerEventHandler(anchor);
			});
		});
	}
	registerEventHandler(elem: HTMLAnchorElement): void {
		elem.addEventListener("click", (e) => {
			e.preventDefault();

			const hash = elem.hash;
			if (hash === "#") return;

			const targetElem = document.querySelector<HTMLElement>(hash);
			if (targetElem === null) return;

			const targetElemRect = targetElem.getBoundingClientRect();

			window.scrollTo({
				top: targetElemRect.top + u.wy + u.scrollGap,
				left: 0,
				behavior: "smooth",
			});
		});
	}
}

/** SmoothScroll を生成して返す。DOM 構築後に自動でアンカーへハンドラを登録する。 */
export function createSmoothScroll(customOption?: CustomOption): SmoothScroll {
	return new SmoothScroll(customOption);
}
