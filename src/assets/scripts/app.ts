import Accordion from "./modules/accordion";
import CheckScrolled from "./modules/check-scrolled";
import initDisplayPosition from "./modules/init-display-position";
import NavManager from "./modules/nav-manager";
import ScrollAnimation from "./modules/scroll-animation";
import SmoothScroll from "./modules/smooth-scroll";
import SwipeFigure from "./modules/swipe-figure";
import Tab from "./modules/tab";

new ScrollAnimation();
new SwipeFigure();
new CheckScrolled();
new SmoothScroll();
new NavManager({
	menuSelector: ".site-header__nav",
});

const accordionEls = document.querySelectorAll("[data-accordion]");
for (const accordionEl of accordionEls) {
	if (accordionEl instanceof HTMLButtonElement) {
		new Accordion(accordionEl);
	} else {
		console.warn("Invalid element type for Accordion:", accordionEl);
	}
}

new Tab();

initDisplayPosition();
