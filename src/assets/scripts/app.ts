import Swiper from "swiper";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";

import { init as accordion } from "./modules/accordion";
import {
	addDeviceClass,
	addLoadedClass,
	initScrollbarWidth,
	initScrolledClass,
} from "./modules/body-class";
import { init as clipboardCopy } from "./modules/clipboard-copy";
import { init as displayPosition } from "./modules/init-display-position";
import { init as modal } from "./modules/modal";
import { createMegaMenu, createNav } from "./modules/nav";
import { init as tab } from "./modules/tab";
import { init as toggle } from "./modules/toggle";

addLoadedClass();
addDeviceClass();
initScrollbarWidth();
initScrolledClass();

createNav(".l-site-menu", ".l-site-menu-button", {
	preventScroll: true,
	closeOnLinkClick: true,
});
createMegaMenu(".l-site-nav");

modal();
accordion();
tab();
toggle();
clipboardCopy();

const carousels = document.querySelectorAll(".c-carousel-horizontal-3");
for (const swiperEl of carousels) {
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
}

displayPosition();
