import { slideUp, slideDown } from "./utility";

export class Accordion {
	buttonEl: HTMLButtonElement;
	panelEl: HTMLElement;
	closeButtonEl: HTMLButtonElement | null;
	isAnimating: boolean;
	constructor(domNode: HTMLButtonElement) {
		this.buttonEl = domNode;
		this.isAnimating = false;

		const panelId = this.buttonEl.getAttribute("data-accordion");
		if (!panelId) {
			throw new Error(
				"Accordion button does not have a 'data-accordion' attribute."
			);
		}

		const isExpanded = this.buttonEl.getAttribute("aria-expanded") || "false";

		this.buttonEl.setAttribute("aria-expanded", isExpanded);
		this.buttonEl.setAttribute("aria-controls", panelId);

		const panelEl = document.querySelector(`#${panelId}`);
		if (!panelEl) {
			throw new Error(`Element with ID "${panelId}" was not found.`);
		}
		this.panelEl = panelEl as HTMLElement;

		this.panelEl.setAttribute("aria-labelledby", this.buttonEl.id);
		this.panelEl.setAttribute(
			"aria-hidden",
			isExpanded === "true" ? "false" : "true"
		);
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
			} else {
				this.openPanel();
			}
		});
	}
	closePanel(): void {
		if (this.isAnimating) return;

		this.buttonEl.setAttribute("aria-expanded", "false");
		this.buttonEl.classList.remove("is-expanded");
		this.panelEl.setAttribute("aria-hidden", "true");

		this.isAnimating = true;
		slideUp(this.panelEl, {
			duration: 500,
			onComplete: () => {
				this.isAnimating = false;
			},
		});
	}
	openPanel(): void {
		if (this.isAnimating) return;

		this.buttonEl.setAttribute("aria-expanded", "true");
		this.buttonEl.classList.add("is-expanded");
		this.panelEl.setAttribute("aria-hidden", "false");

		this.isAnimating = true;
		slideDown(this.panelEl, {
			duration: 500,
			onComplete: () => {
				this.isAnimating = false;
			},
		});
	}
}
