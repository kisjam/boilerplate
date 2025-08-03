// import Accordion from "./modules/accordion";
// import CheckScrolled from "./modules/check-scrolled";
import { initDisplayPosition } from "./modules/init-display-position";
import { SmoothScroll } from "./modules/smooth-scroll";
import { updateHeaderHeight } from "./modules/header-height";
import {
	addDeviceClass,
	addLoadedClass,
	addScrollbarWidth,
	addScrolledClass,
} from "./modules/utility";
import { createModal } from "./modules/modal";
import { createNav } from "./modules/nav";
import { initClipboardCopy } from "./modules/clipboard-copy";
import { Accordion } from "./modules/accordion";
import Swiper from "swiper";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";

const modalSearch = createModal("#modal-search", {
	triggerSelector: ".l-site-header__search-button",
	closeSelector: ".c-modal-search__close",
	closeOnBackdropClick: true,
	closeOnEscapeKey: true,
	preventScroll: true,
	focusTrap: true,
});

const navMenu = createNav(".l-site-menu", ".l-site-menu-button", {
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

const carouselHorizontal3s = document.querySelectorAll(
	".c-carousel-horizontal-3"
);
carouselHorizontal3s.forEach((swiperEl, index) => {
	new Swiper(swiperEl as HTMLElement, {
		modules: [Navigation, Pagination],
		enabled: false,

		breakpoints: {
			769: {
				enabled: true,
				slidesPerView: "auto",
				spaceBetween: 24,
				navigation: {
					nextEl: swiperEl.querySelector(
						".c-carousel-horizontal-3__next"
					) as HTMLElement,
					prevEl: swiperEl.querySelector(
						".c-carousel-horizontal-3__prev"
					) as HTMLElement,
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
new SmoothScroll();
