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

// 基盤（body/html の状態クラス・CSS変数）
addLoadedClass();
addDeviceClass();
initScrollbarWidth();
initScrolledClass();

// ナビゲーション
createNav(".l-site-menu", ".l-site-menu-button", {
	preventScroll: true,
	closeOnLinkClick: true,
});
createMegaMenu(".l-site-nav");

// UIコンポーネント
modal();
accordion();
tab();
toggle();
clipboardCopy();

// カルーセル（案件ごとに設定が変わるため app で直接初期化する）
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

// スクロール挙動（ハッシュ位置の補正）
displayPosition();
