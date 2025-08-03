interface NavOptions {
	preventScroll?: boolean;
	closeOnLinkClick?: boolean;
	beforeOpen?: () => void;
	afterOpen?: () => void;
	beforeClose?: () => void;
	afterClose?: () => void;
}

const DEFAULT_OPTIONS: Required<NavOptions> = {
	preventScroll: true,
	closeOnLinkClick: true,
	beforeOpen: () => {},
	afterOpen: () => {},
	beforeClose: () => {},
	afterClose: () => {},
};

export class Nav {
	private navElement: HTMLElement;
	private toggleButton: HTMLElement;
	private options: Required<NavOptions>;
	private isOpen: boolean = false;
	private originalBodyStyles: Partial<CSSStyleDeclaration> = {};

	constructor(navSelector: string, toggleSelector: string, options: NavOptions = {}) {
		const navEl = document.querySelector(navSelector) as HTMLElement;
		const toggleEl = document.querySelector(toggleSelector) as HTMLElement;

		if (!navEl) {
			throw new Error(`Nav element not found: ${navSelector}`);
		}

		if (!toggleEl) {
			throw new Error(`Toggle button not found: ${toggleSelector}`);
		}

		this.navElement = navEl;
		this.toggleButton = toggleEl;
		this.options = { ...DEFAULT_OPTIONS, ...options };

		this.init();
	}

	private init(): void {
		this.navElement.setAttribute("aria-hidden", "true");
		this.toggleButton.setAttribute("aria-expanded", "false");
		this.toggleButton.setAttribute("aria-controls", this.navElement.id || "navigation");

		this.setupEventListeners();
	}

	private setupEventListeners(): void {
		this.toggleButton.addEventListener("click", this.toggle.bind(this));

		if (this.options.closeOnLinkClick) {
			const links = this.navElement.querySelectorAll("a");
			links.forEach(link => {
				link.addEventListener("click", () => {
					this.close();
				});
			});
		}

		document.addEventListener("keydown", this.handleEscapeKey.bind(this));
	}

	private handleEscapeKey(event: KeyboardEvent): void {
		if (event.key === "Escape" && this.isOpen) {
			this.close();
		}
	}

	private preventScroll(): void {
		if (!this.options.preventScroll) return;

		this.originalBodyStyles = {
			overflow: document.body.style.overflow,
		};

		document.body.style.overflow = "hidden";
	}

	private restoreScroll(): void {
		if (!this.options.preventScroll) return;

		document.body.style.overflow = this.originalBodyStyles.overflow || "";
	}

	public open(): void {
		if (this.isOpen) return;

		this.options.beforeOpen();
		this.preventScroll();

		this.navElement.classList.add("is-open");
		this.toggleButton.classList.add("is-open");
		this.navElement.setAttribute("aria-hidden", "false");
		this.toggleButton.setAttribute("aria-expanded", "true");

		this.isOpen = true;
		this.options.afterOpen();
	}

	public close(): void {
		if (!this.isOpen) return;

		this.options.beforeClose();

		this.navElement.classList.remove("is-open");
		this.toggleButton.classList.remove("is-open");
		this.navElement.setAttribute("aria-hidden", "true");
		this.toggleButton.setAttribute("aria-expanded", "false");

		this.restoreScroll();

		this.isOpen = false;
		this.options.afterClose();
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

export const createNav = (navSelector: string, toggleSelector: string, options?: NavOptions): Nav => {
	return new Nav(navSelector, toggleSelector, options);
};