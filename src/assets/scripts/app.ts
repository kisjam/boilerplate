// import Accordion from "./modules/accordion";
// import CheckScrolled from "./modules/check-scrolled";

import Swiper from "swiper";
import { Navigation, Pagination } from "swiper/modules";
import { Accordion } from "./modules/accordion";
import { initClipboardCopy } from "./modules/clipboard-copy";
import { initDisplayPosition } from "./modules/init-display-position";
import { Modal } from "./modules/modal";
import { createNav } from "./modules/nav";
import { initToggle } from "./modules/toggle";
import {
	addDeviceClass,
	addLoadedClass,
	addScrollbarWidth,
	addScrolledClass,
} from "./modules/utility";
import "swiper/css";

new Modal();

const _navMenu = createNav(".l-site-menu", ".l-site-menu-button", {
	preventScroll: true,
	closeOnLinkClick: true,
});

// new ScrollAnimation();
// new SwipeFigure();
// new CheckScrolled();
// new SmoothScroll();
// new NavManager({
// 	menuSelector: ".site-header__nav",
// });

const carouselHorizontal3s = document.querySelectorAll(".c-carousel-horizontal-3");
carouselHorizontal3s.forEach((swiperEl, _index) => {
	new Swiper(swiperEl as HTMLElement, {
		modules: [Navigation, Pagination],
		enabled: false,

		breakpoints: {
			769: {
				enabled: true,
				slidesPerView: "auto",
				spaceBetween: 24,
				navigation: {
					nextEl: swiperEl.querySelector(".c-carousel-horizontal-3__next") as HTMLElement,
					prevEl: swiperEl.querySelector(".c-carousel-horizontal-3__prev") as HTMLElement,
				},
			},
		},
	});
});

const accordionEls = document.querySelectorAll("[data-accordion]");
for (const accordionEl of accordionEls) {
	if (accordionEl instanceof HTMLButtonElement) {
		new Accordion(accordionEl);
	} else {
		console.warn("Invalid element type for Accordion:", accordionEl);
	}
}

addLoadedClass();
addScrollbarWidth();
addDeviceClass();
addScrolledClass();
initDisplayPosition();
initClipboardCopy();
initToggle();
// new SmoothScroll();
