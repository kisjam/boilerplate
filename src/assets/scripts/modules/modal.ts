export function init(options?: ModalOptions): void {
	new Modal(options);
}

interface ModalOptions {
	closeOnBackdropClick?: boolean;
}

export class Modal {
	private currentDialog: HTMLElement | null = null;
	private lastFocusedElement: HTMLElement | null = null;
	private closeOnBackdropClick: boolean;
	private clickHandler: (e: MouseEvent) => void;
	private keydownHandler: (e: KeyboardEvent) => void;

	constructor(options: ModalOptions = {}) {
		this.closeOnBackdropClick = options.closeOnBackdropClick ?? true;

		this.clickHandler = this.handleClick.bind(this);
		this.keydownHandler = this.handleKeydown.bind(this);

		if (!document.querySelector("[data-modal-open]")) return;

		this.setupAria();
		this.init();
	}

	private setupAria(): void {
		document.querySelectorAll<HTMLElement>("[data-modal-open]").forEach((button) => {
			const targetId = button.getAttribute("data-modal-open");
			if (!targetId) return;

			button.setAttribute("aria-haspopup", "dialog");
			button.setAttribute("aria-controls", targetId);

			const dialog = document.getElementById(targetId);
			if (!dialog) return;

			dialog.setAttribute("data-modal-dialog", "");
			dialog.setAttribute("role", "dialog");
			dialog.setAttribute("aria-modal", "true");
			dialog.setAttribute("aria-hidden", "true");

			if (!dialog.querySelector("[data-modal-backdrop]")) {
				const backdrop = document.createElement("div");
				backdrop.classList.add("c-modal__backdrop");
				backdrop.setAttribute("data-modal-backdrop", "");
				backdrop.setAttribute("aria-hidden", "true");
				dialog.insertBefore(backdrop, dialog.firstChild);
			}
		});
	}

	private init(): void {
		document.addEventListener("click", this.clickHandler);
		document.addEventListener("keydown", this.keydownHandler);
	}

	private handleClick(e: MouseEvent): void {
		const target = e.target as HTMLElement;

		const openButton = target.closest<HTMLElement>("[data-modal-open]");
		if (openButton && !openButton.closest("[data-modal-dialog]")) {
			this.lastFocusedElement = openButton;
			this.open(openButton.getAttribute("data-modal-open")!);
			return;
		}

		if (target.closest("[data-modal-close]")) {
			if (this.currentDialog) this.close(this.currentDialog);
			return;
		}

		if (this.closeOnBackdropClick && target.closest("[data-modal-backdrop]")) {
			if (this.currentDialog) this.close(this.currentDialog);
		}
	}

	private handleKeydown(e: KeyboardEvent): void {
		if (!this.currentDialog) return;
		if (e.key === "Escape") {
			this.close(this.currentDialog);
		} else if (e.key === "Tab") {
			this.trapFocus(e, this.currentDialog);
		}
	}

	private trapFocus(e: KeyboardEvent, dialog: HTMLElement): void {
		const selectors =
			'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
		// getClientRects() は position:fixed でも可視なら矩形を返す（offsetParent は fixed で null になり誤判定）
		const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(selectors)).filter(
			(el) => el.getClientRects().length > 0,
		);

		if (focusable.length === 0) return;

		const first = focusable[0];
		const last = focusable[focusable.length - 1];

		if (e.shiftKey) {
			if (document.activeElement === first) {
				e.preventDefault();
				last.focus();
			}
		} else {
			if (document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		}
	}

	open(targetId: string): void {
		if (this.currentDialog) {
			this.currentDialog.classList.remove("is-open");
			this.currentDialog.setAttribute("aria-hidden", "true");
		}

		const dialog = document.getElementById(targetId);
		if (!dialog) return;

		dialog.classList.add("is-open");
		dialog.setAttribute("aria-hidden", "false");

		document.documentElement.classList.add("is-modal-open");

		this.currentDialog = dialog;

		const closeButton = dialog.querySelector<HTMLElement>("[data-modal-close]");
		if (closeButton) {
			closeButton.focus();
		} else {
			dialog.setAttribute("tabindex", "-1");
			dialog.focus();
		}
	}

	close(dialog: HTMLElement): void {
		dialog.classList.remove("is-open");
		dialog.setAttribute("aria-hidden", "true");

		document.documentElement.classList.remove("is-modal-open");

		this.currentDialog = null;

		if (this.lastFocusedElement) {
			this.lastFocusedElement.focus();
			this.lastFocusedElement = null;
		}
	}

	destroy(): void {
		if (this.currentDialog) this.close(this.currentDialog);
		document.removeEventListener("click", this.clickHandler);
		document.removeEventListener("keydown", this.keydownHandler);
	}
}
