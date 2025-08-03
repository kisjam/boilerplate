import { u } from "./utility";

interface ModalOptions {
	closeOnBackdropClick?: boolean;
	closeOnEscapeKey?: boolean;
	preventScroll?: boolean;
	focusTrap?: boolean;
	triggerSelector?: string;
	closeSelector?: string;
	beforeOpen?: () => void;
	afterOpen?: () => void;
	beforeClose?: () => void;
	afterClose?: () => void;
}

const DEFAULT_OPTIONS: Required<ModalOptions> = {
	closeOnBackdropClick: true,
	closeOnEscapeKey: true,
	preventScroll: true,
	focusTrap: true,
	triggerSelector: "",
	closeSelector: "",
	beforeOpen: () => {},
	afterOpen: () => {},
	beforeClose: () => {},
	afterClose: () => {},
};
export class Modal {
	private element: HTMLElement;
	private options: Required<ModalOptions>;
	private isOpen: boolean = false;
	private previousActiveElement: Element | null = null;
	private focusableElements: HTMLElement[] = [];
	private originalBodyStyles: Partial<CSSStyleDeclaration> = {};

	constructor(element: HTMLElement | string, options: ModalOptions = {}) {
		if (typeof element === "string") {
			const el = document.querySelector(element) as HTMLElement;
			if (!el) {
				throw new Error(`Modal element not found: ${element}`);
			}
			this.element = el;
		} else {
			this.element = element;
		}

		this.options = { ...DEFAULT_OPTIONS, ...options };
		this.init();
	}

	private init(): void {
		this.element.setAttribute("aria-hidden", "true");
		this.element.setAttribute("role", "dialog");
		this.element.setAttribute("aria-modal", "true");

		this.setupEventListeners();
	}

	private setupEventListeners(): void {
		if (this.options.closeOnEscapeKey) {
			document.addEventListener("keydown", this.handleEscapeKey.bind(this));
		}

		if (this.options.closeOnBackdropClick) {
			this.element.addEventListener("click", this.handleBackdropClick.bind(this));
		}

		if (this.options.focusTrap) {
			this.element.addEventListener("keydown", this.handleFocusTrap.bind(this));
		}

		if (this.options.triggerSelector) {
			this.setupTriggerButtons();
		}

		if (this.options.closeSelector) {
			this.setupCloseButtons();
		}
	}

	private setupTriggerButtons(): void {
		const triggerButtons = document.querySelectorAll(this.options.triggerSelector);
		triggerButtons.forEach(button => {
			button.addEventListener("click", (e) => {
				e.preventDefault();
				this.open();
			});
		});
	}

	private setupCloseButtons(): void {
		const closeButtons = document.querySelectorAll(this.options.closeSelector);
		closeButtons.forEach(button => {
			button.addEventListener("click", (e) => {
				e.preventDefault();
				this.close();
			});
		});
	}

	private handleBackdropClick(event: MouseEvent): void {
		if (event.target === this.element) {
			this.close();
		}
	}

	private handleEscapeKey(event: KeyboardEvent): void {
		if (event.key === "Escape" && this.isOpen) {
			this.close();
		}
	}

	private handleFocusTrap(event: KeyboardEvent): void {
		if (event.key !== "Tab" || this.focusableElements.length === 0) return;

		const firstElement = this.focusableElements[0];
		const lastElement = this.focusableElements[this.focusableElements.length - 1];

		if (event.shiftKey) {
			if (document.activeElement === firstElement) {
				event.preventDefault();
				lastElement.focus();
			}
		} else {
			if (document.activeElement === lastElement) {
				event.preventDefault();
				firstElement.focus();
			}
		}
	}

	private getFocusableElements(): HTMLElement[] {
		const selectors = [
			'button:not([disabled])',
			'[href]',
			'input:not([disabled])',
			'select:not([disabled])',
			'textarea:not([disabled])',
			'[tabindex]:not([tabindex="-1"])',
		];

		return Array.from(this.element.querySelectorAll(selectors.join(", "))) as HTMLElement[];
	}

	private preventScroll(): void {
		if (!this.options.preventScroll) return;

		this.originalBodyStyles = {
			overflow: document.body.style.overflow,
			paddingRight: document.body.style.paddingRight,
		};

		const scrollbarWidth = u.getScrollbarWidth();
		document.body.style.overflow = "hidden";
		document.body.style.paddingRight = `${scrollbarWidth}px`;
	}

	private restoreScroll(): void {
		if (!this.options.preventScroll) return;

		document.body.style.overflow = this.originalBodyStyles.overflow || "";
		document.body.style.paddingRight = this.originalBodyStyles.paddingRight || "";
	}

	public open(): void {
		if (this.isOpen) return;

		this.options.beforeOpen();
		this.previousActiveElement = document.activeElement;
		this.preventScroll();

		this.element.setAttribute("open", "");
		this.element.setAttribute("aria-hidden", "false");

		this.focusableElements = this.getFocusableElements();

		if (this.focusableElements.length > 0) {
			this.focusableElements[0].focus();
		}

		this.isOpen = true;
		this.options.afterOpen();
	}

	public close(): void {
		if (!this.isOpen) return;

		this.options.beforeClose();

		this.element.removeAttribute("open");

		const handleTransitionEnd = (event: TransitionEvent): void => {
			if (event.target !== this.element) return;

			this.element.removeEventListener("transitionend", handleTransitionEnd);
			this.element.setAttribute("aria-hidden", "true");

			this.restoreScroll();

			if (this.previousActiveElement instanceof HTMLElement) {
				this.previousActiveElement.focus();
			}

			this.isOpen = false;
			this.options.afterClose();
		};

		this.element.addEventListener("transitionend", handleTransitionEnd);

		setTimeout(() => {
			if (this.isOpen) {
				this.element.removeEventListener("transitionend", handleTransitionEnd);
				this.element.setAttribute("aria-hidden", "true");
				this.restoreScroll();

				if (this.previousActiveElement instanceof HTMLElement) {
					this.previousActiveElement.focus();
				}

				this.isOpen = false;
				this.options.afterClose();
			}
		}, 600);
	}

	public toggle(): void {
		if (this.isOpen) {
			this.close();
		} else {
			this.open();
		}
	}

	public getIsOpen(): boolean {
		return this.isOpen;
	}

	public destroy(): void {
		this.close();
		document.removeEventListener("keydown", this.handleEscapeKey.bind(this));
	}
}

export const createModal = (element: HTMLElement | string, options?: ModalOptions): Modal => {
	return new Modal(element, options);
};