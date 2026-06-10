import Swiper from "swiper";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";

import { init as accordion } from "./modules/accordion";
import { init as clipboardCopy } from "./modules/clipboard-copy";
import { init as displayPosition } from "./modules/init-display-position";
import { init as modal } from "./modules/modal";
import { createMegaMenu, createNav } from "./modules/nav";
import { init as tab } from "./modules/tab";
import { init as toggle } from "./modules/toggle";
import {
	addDeviceClass,
	addLoadedClass,
	initScrollbarWidth,
	initScrolledClass,
} from "./modules/utility";

modal();

const _navMenu = createNav(".l-site-menu", ".l-site-menu-button", {
	preventScroll: true,
	closeOnLinkClick: true,
});
const _megaMenu = createMegaMenu(".l-site-nav");

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

accordion();
tab();

addLoadedClass();
addDeviceClass();
initScrollbarWidth();
initScrolledClass();
displayPosition();
clipboardCopy();
toggle();
