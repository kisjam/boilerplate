/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/assets/js/modules/accordion.ts":
/*!********************************************!*\
  !*** ./src/assets/js/modules/accordion.ts ***!
  \********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ Accordion; }
/* harmony export */ });
class Accordion {
    constructor(domNode) {
        this.buttonEl = domNode;
        this.isAnimating = false;
        const panelId = this.buttonEl.getAttribute("data-accordion");
        if (!panelId) {
            throw new Error("Accordion button does not have a 'data-accordion' attribute.");
        }
        const isExpanded = this.buttonEl.getAttribute("aria-expanded") || "false";
        this.buttonEl.setAttribute("aria-expanded", isExpanded);
        this.buttonEl.setAttribute("aria-controls", panelId);
        const panelEl = document.querySelector(`#${panelId}`);
        if (!panelEl) {
            throw new Error(`Element with ID "${panelId}" was not found.`);
        }
        this.panelEl = panelEl;
        this.panelEl.setAttribute("aria-labelledby", this.buttonEl.id);
        this.panelEl.setAttribute("aria-hidden", isExpanded === "true" ? "false" : "true");
        this.panelEl.style.display = isExpanded === "true" ? "block" : "none";
        this.closeButtonEl = this.panelEl.querySelector("[data-accordion-close]");
        this.closeButtonEl?.addEventListener("click", (e) => {
            e.preventDefault();
            this.closePanel();
        });
        this.buttonEl.addEventListener("click", (e) => {
            e.preventDefault();
            if (this.buttonEl.getAttribute("aria-expanded") === "true") {
                this.closePanel();
            }
            else {
                this.openPanel();
            }
        });
    }
    closePanel() {
        if (this.isAnimating)
            return;
        this.buttonEl.setAttribute("aria-expanded", "false");
        this.buttonEl.classList.remove("-is-expanded");
        this.panelEl.setAttribute("aria-hidden", "true");
        this.slideUp(this.panelEl);
    }
    openPanel() {
        if (this.isAnimating)
            return;
        this.buttonEl.setAttribute("aria-expanded", "true");
        this.buttonEl.classList.add("-is-expanded");
        this.panelEl.setAttribute("aria-hidden", "false");
        this.slideDown(this.panelEl);
    }
    slideUp(element, duration = 500) {
        this.isAnimating = true;
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
        const slideUpCallback = () => {
            element.style.display = "none";
            element.style.removeProperty("height");
            element.style.removeProperty("padding-top");
            element.style.removeProperty("padding-bottom");
            element.style.removeProperty("margin-top");
            element.style.removeProperty("margin-bottom");
            element.style.removeProperty("overflow");
            element.style.removeProperty("transition-duration");
            element.style.removeProperty("transition-property");
            this.isAnimating = false;
            element.removeEventListener("transitionend", slideUpCallback);
        };
        element.addEventListener("transitionend", slideUpCallback);
    }
    slideDown(element, duration = 500) {
        this.isAnimating = true;
        element.style.removeProperty("display");
        let display = window.getComputedStyle(element).display;
        if (display === "none")
            display = "block";
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
        const slideDownCallback = () => {
            element.style.removeProperty("height");
            element.style.removeProperty("padding-top");
            element.style.removeProperty("padding-bottom");
            element.style.removeProperty("margin-top");
            element.style.removeProperty("margin-bottom");
            element.style.removeProperty("overflow");
            element.style.removeProperty("transition-duration");
            element.style.removeProperty("transition-property");
            this.isAnimating = false;
            element.removeEventListener("transitionend", slideDownCallback);
        };
        element.addEventListener("transitionend", slideDownCallback);
    }
}


/***/ }),

/***/ "./src/assets/js/modules/check-scrolled.ts":
/*!*************************************************!*\
  !*** ./src/assets/js/modules/check-scrolled.ts ***!
  \*************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ CheckScrolled; }
/* harmony export */ });
/* harmony import */ var _utility__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utility */ "./src/assets/js/modules/utility.ts");

class CheckScrolled {
    constructor(customOption) {
        const defaultOption = {
            selector: "body",
            fireClass: "-scrolled",
            fireRange: 100,
        };
        this.option = { ...defaultOption, ...customOption };
        document.addEventListener("DOMContentLoaded", () => {
            const bodyElem = document.querySelector(this.option.selector);
            if (bodyElem === null)
                return;
            window.addEventListener("scroll", () => {
                if (_utility__WEBPACK_IMPORTED_MODULE_0__.u.wy < this.option.fireRange) {
                    bodyElem.classList.remove(this.option.fireClass);
                }
                else {
                    bodyElem.classList.add(this.option.fireClass);
                }
            });
        });
    }
}


/***/ }),

/***/ "./src/assets/js/modules/init-display-position.ts":
/*!********************************************************!*\
  !*** ./src/assets/js/modules/init-display-position.ts ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utility__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utility */ "./src/assets/js/modules/utility.ts");

const initDisplayPosition = () => {
    const hash = window.location.hash;
    if (hash === "")
        return;
    window.location.hash = hash + "_";
    window.addEventListener("load", () => {
        const targetElem = document.querySelector(hash);
        if (targetElem === null)
            return;
        setTimeout(() => {
            window.scrollTo(0, targetElem.getBoundingClientRect().top + _utility__WEBPACK_IMPORTED_MODULE_0__.u.wy + _utility__WEBPACK_IMPORTED_MODULE_0__.u.scrollGap);
        }, 10);
        history.replaceState(null, "", hash);
    });
};
/* harmony default export */ __webpack_exports__["default"] = (initDisplayPosition);


/***/ }),

/***/ "./src/assets/js/modules/nav-manager.ts":
/*!**********************************************!*\
  !*** ./src/assets/js/modules/nav-manager.ts ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ NavManager; }
/* harmony export */ });
/* harmony import */ var _utility__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utility */ "./src/assets/js/modules/utility.ts");

class NavManager {
    constructor(customOption) {
        this.isMenuActive = false;
        this.menuButtonElem = null;
        this.menuElem = null;
        this.hiddenElems = null;
        this.prevPosY = 0;
        const defaultOption = {
            menuSelector: ".site-menu",
            menuButtonSelector: ".site-menu-button",
            menuAvtiveClass: "-is-open",
            hiddenSelector: ".site-main, .site-footer, .site-cv",
        };
        this.option = { ...defaultOption, ...customOption };
        document.addEventListener("DOMContentLoaded", () => {
            this.menuButtonElem = document.querySelector(this.option.menuButtonSelector);
            this.menuElem = document.querySelector(this.option.menuSelector);
            this.hiddenElems = document.querySelectorAll(this.option.hiddenSelector);
            if (this.menuButtonElem === null)
                return;
            this.menuButtonElem.addEventListener("click", () => {
                this.isMenuActive = !this.isMenuActive;
                this.rendar();
            });
            _utility__WEBPACK_IMPORTED_MODULE_0__.u.mq.addEventListener("change", (e) => {
                if (!e.matches) {
                    this.closeMenu();
                }
            });
        });
    }
    closeMenu() {
        this.isMenuActive = false;
        this.rendar();
    }
    rendar() {
        if (this.menuButtonElem === null ||
            this.menuElem === null ||
            this.hiddenElems === null)
            return;
        if (this.isMenuActive) {
            this.menuButtonElem.classList.add(this.option.menuAvtiveClass);
            this.menuElem.classList.add(this.option.menuAvtiveClass);
            this.prevPosY = _utility__WEBPACK_IMPORTED_MODULE_0__.u.wy;
            this.hiddenElems.forEach((elem) => {
                elem.classList.add("hidden");
            });
        }
        else {
            this.menuButtonElem.classList.remove(this.option.menuAvtiveClass);
            this.menuElem.classList.remove(this.option.menuAvtiveClass);
            this.hiddenElems.forEach((elem) => {
                elem.classList.remove("hidden");
            });
            window.scrollTo(0, this.prevPosY);
        }
    }
}


/***/ }),

/***/ "./src/assets/js/modules/scroll-animation.ts":
/*!***************************************************!*\
  !*** ./src/assets/js/modules/scroll-animation.ts ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ ScrollAnimation; }
/* harmony export */ });
/* harmony import */ var _utility__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utility */ "./src/assets/js/modules/utility.ts");

class ScrollAnimation {
    constructor(customOption) {
        const defaultOption = {
            selector: ".js-sa",
            fireClass: "-run",
            fireRange: 0.8,
        };
        this.option = { ...defaultOption, ...customOption };
        document.addEventListener("DOMContentLoaded", () => {
            const elems = document.querySelectorAll(this.option.selector);
            if (elems === null)
                return;
            elems.forEach((elem) => {
                this.registEventHandler(elem);
            });
        });
    }
    registEventHandler(elem) {
        const rendar = () => {
            let targetPosY = elem.getBoundingClientRect().top;
            if (_utility__WEBPACK_IMPORTED_MODULE_0__.u.wy + _utility__WEBPACK_IMPORTED_MODULE_0__.u.wh * this.option.fireRange > targetPosY + _utility__WEBPACK_IMPORTED_MODULE_0__.u.wy) {
                window.removeEventListener("scroll", rendar);
                elem.classList.add(this.option.fireClass);
            }
        };
        window.addEventListener("DOMContentLoaded", rendar);
        window.addEventListener("scroll", rendar);
        rendar();
    }
}


/***/ }),

/***/ "./src/assets/js/modules/smooth-scroll.ts":
/*!************************************************!*\
  !*** ./src/assets/js/modules/smooth-scroll.ts ***!
  \************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ SmoothScroll; }
/* harmony export */ });
/* harmony import */ var _utility__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utility */ "./src/assets/js/modules/utility.ts");

class SmoothScroll {
    constructor(customOption) {
        const defaultOption = {
            selector: 'a[href^="#"]:not(.js-ignore-smooth)',
            ignoreSelector: "",
        };
        this.option = { ...defaultOption, ...customOption };
        document.addEventListener("DOMContentLoaded", () => {
            const anchors = document.querySelectorAll(this.option.selector + this.option.ignoreSelector);
            if (anchors === null)
                return;
            anchors.forEach((anchor) => {
                this.registEventHandler(anchor);
            });
        });
    }
    registEventHandler(elem) {
        elem.addEventListener("click", (e) => {
            e.preventDefault();
            const hash = elem.hash;
            if (hash === "#")
                return;
            const targetElem = document.querySelector(hash);
            if (targetElem === null)
                return;
            const targetElemRect = targetElem.getBoundingClientRect();
            window.scrollTo({
                top: targetElemRect.top + _utility__WEBPACK_IMPORTED_MODULE_0__.u.wy + _utility__WEBPACK_IMPORTED_MODULE_0__.u.scrollGap,
                left: 0,
                behavior: "smooth",
            });
        });
    }
}


/***/ }),

/***/ "./src/assets/js/modules/swipe-figure.ts":
/*!***********************************************!*\
  !*** ./src/assets/js/modules/swipe-figure.ts ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ SwipeFigure; }
/* harmony export */ });
class SwipeFigure {
    constructor(customOption) {
        const defaultOption = {
            selector: '.js-swipe',
            scrolledClass: '-scrolled'
        };
        this.option = { ...defaultOption, ...customOption };
        document.addEventListener('DOMContentLoaded', () => {
            const elems = document.querySelectorAll(this.option.selector);
            if (elems === null)
                return;
            elems.forEach((elem) => {
                this.registEventHandler(elem);
            });
        });
    }
    registEventHandler(elem) {
        elem.classList.add('swipe');
        const scrollEvent = () => {
            elem.removeEventListener('scroll', scrollEvent);
            elem.classList.add(this.option.scrolledClass);
        };
        elem.addEventListener('scroll', scrollEvent);
    }
}


/***/ }),

/***/ "./src/assets/js/modules/tab.ts":
/*!**************************************!*\
  !*** ./src/assets/js/modules/tab.ts ***!
  \**************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ Tab; }
/* harmony export */ });
class Tab {
    constructor(selector = "[data-tab]", customOption) {
        const defaultOption = {
            buttonSelector: "[data-tab-target]",
            contentSelector: "[data-tab-content]",
        };
        this.option = { ...defaultOption, ...customOption };
        document.addEventListener("DOMContentLoaded", () => {
            const elems = document.querySelectorAll(selector);
            if (elems === null)
                return;
            elems.forEach((elem) => {
                this.registEventHandler(elem);
            });
        });
    }
    registEventHandler(elem) {
        const tabButtons = elem.querySelectorAll(this.option.buttonSelector);
        const tabContents = elem.querySelectorAll(this.option.contentSelector);
        const rendar = () => {
            tabContents.forEach((content) => {
                content.classList.remove("-is-open");
            });
            const content = elem.querySelector(`[data-tab-content="${targetContent}"]`);
            content?.classList.add("-is-open");
            tabButtons.forEach((button) => {
                button.classList.remove("-is-active");
            });
            const target = elem.querySelector(`[data-tab-target="${targetContent}"]`);
            target?.classList.add("-is-active");
        };
        let targetContent;
        tabButtons.forEach((button) => {
            button.addEventListener("click", (e) => {
                e.preventDefault();
                targetContent = button.dataset.tabTarget;
                rendar();
            });
        });
        targetContent = tabButtons[0].dataset.tabTarget;
        rendar();
    }
}


/***/ }),

/***/ "./src/assets/js/modules/utility.ts":
/*!******************************************!*\
  !*** ./src/assets/js/modules/utility.ts ***!
  \******************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addLoadedClass: function() { return /* binding */ addLoadedClass; },
/* harmony export */   addScrollbarWidth: function() { return /* binding */ addScrollbarWidth; },
/* harmony export */   slideDown: function() { return /* binding */ slideDown; },
/* harmony export */   slideUp: function() { return /* binding */ slideUp; },
/* harmony export */   u: function() { return /* binding */ u; }
/* harmony export */ });
class Utility {
    constructor() {
        this.breakpoint = "(max-width: 1024px)";
        this.mq = window.matchMedia(this.breakpoint);
    }
    get ww() {
        return window.innerWidth;
    }
    get wh() {
        return window.innerHeight;
    }
    get wy() {
        return window.pageYOffset;
    }
    get scrollGap() {
        return this.ww > 1024 ? -120 : -80;
    }
}
const u = new Utility();
const addScrollbarWidth = () => {
    const addCustomProperty = () => {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.documentElement.style.setProperty("--scrollbar", `${scrollbarWidth}px`);
    };
    window.addEventListener("load", addCustomProperty);
    window.addEventListener("resize", addCustomProperty);
    addCustomProperty();
};
const addLoadedClass = () => {
    document.addEventListener("DOMContentLoaded", () => {
        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
                document.body.classList.add("is-loaded");
            });
        });
    });
};
const slideUp = (element, duration = 600, onComplete) => {
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
    const slideUpCallback = (e) => {
        if (e.target !== e.currentTarget)
            return;
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
        if (onComplete)
            onComplete();
    };
    element.addEventListener("transitionend", slideUpCallback);
};
const slideDown = (element, duration = 600, onComplete) => {
    element.style.removeProperty("display");
    let display = window.getComputedStyle(element).display;
    if (display === "none")
        display = "block";
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
    const slideDownCallback = (e) => {
        if (e.target !== e.currentTarget)
            return;
        element.style.removeProperty("height");
        element.style.removeProperty("padding-top");
        element.style.removeProperty("padding-bottom");
        element.style.removeProperty("margin-top");
        element.style.removeProperty("margin-bottom");
        element.style.removeProperty("overflow");
        element.style.removeProperty("transition-duration");
        element.style.removeProperty("transition-property");
        element.removeEventListener("transitionend", slideDownCallback);
        if (onComplete)
            onComplete();
    };
    element.addEventListener("transitionend", slideDownCallback);
};


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
!function() {
/*!******************************!*\
  !*** ./src/assets/js/app.ts ***!
  \******************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _modules_init_display_position__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./modules/init-display-position */ "./src/assets/js/modules/init-display-position.ts");
/* harmony import */ var _modules_smooth_scroll__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./modules/smooth-scroll */ "./src/assets/js/modules/smooth-scroll.ts");
/* harmony import */ var _modules_scroll_animation__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./modules/scroll-animation */ "./src/assets/js/modules/scroll-animation.ts");
/* harmony import */ var _modules_swipe_figure__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./modules/swipe-figure */ "./src/assets/js/modules/swipe-figure.ts");
/* harmony import */ var _modules_check_scrolled__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./modules/check-scrolled */ "./src/assets/js/modules/check-scrolled.ts");
/* harmony import */ var _modules_nav_manager__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./modules/nav-manager */ "./src/assets/js/modules/nav-manager.ts");
/* harmony import */ var _modules_accordion__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./modules/accordion */ "./src/assets/js/modules/accordion.ts");
/* harmony import */ var _modules_tab__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./modules/tab */ "./src/assets/js/modules/tab.ts");








new _modules_scroll_animation__WEBPACK_IMPORTED_MODULE_2__["default"]();
new _modules_swipe_figure__WEBPACK_IMPORTED_MODULE_3__["default"]();
new _modules_check_scrolled__WEBPACK_IMPORTED_MODULE_4__["default"]();
new _modules_smooth_scroll__WEBPACK_IMPORTED_MODULE_1__["default"]();
new _modules_nav_manager__WEBPACK_IMPORTED_MODULE_5__["default"]({
    menuSelector: ".site-header__nav",
});
const accordionEls = document.querySelectorAll("[data-accordion]");
accordionEls.forEach((accordionEl) => {
    if (accordionEl instanceof HTMLButtonElement) {
        new _modules_accordion__WEBPACK_IMPORTED_MODULE_6__["default"](accordionEl);
    }
    else {
        console.warn("Invalid element type for Accordion:", accordionEl);
    }
});
new _modules_tab__WEBPACK_IMPORTED_MODULE_7__["default"]();
(0,_modules_init_display_position__WEBPACK_IMPORTED_MODULE_0__["default"])();

}();
/******/ })()
;
//# sourceMappingURL=bundle.js.map