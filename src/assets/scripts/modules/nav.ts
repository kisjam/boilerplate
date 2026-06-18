interface NavOptions {
	preventScroll?: boolean;
	closeOnLinkClick?: boolean;
	desktopMinWidth?: string;
	beforeOpen?: () => void;
	afterOpen?: () => void;
	beforeClose?: () => void;
	afterClose?: () => void;
}

const DEFAULT_OPTIONS: Required<NavOptions> = {
	preventScroll: true,
	closeOnLinkClick: true,
	desktopMinWidth: "769px",
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
	private mq: MediaQueryList;
	private boundHandleToggle: () => void;
	private boundHandleEscape: (e: KeyboardEvent) => void;
	private boundHandleMediaChange: () => void;

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
		this.mq = window.matchMedia(`(min-width: ${this.options.desktopMinWidth})`);
		this.boundHandleToggle = this.toggle.bind(this);
		this.boundHandleEscape = this.handleEscapeKey.bind(this);
		this.boundHandleMediaChange = this.handleMediaChange.bind(this);

		this.init();
	}

	private isDesktop(): boolean {
		return this.mq.matches;
	}

	private init(): void {
		this.toggleButton.setAttribute("aria-controls", this.navElement.id || "navigation");
		this.applyViewportState();
		this.setupEventListeners();
	}

	private applyViewportState(): void {
		if (this.isDesktop()) {
			this.navElement.removeAttribute("aria-hidden");
			this.navElement.removeAttribute("inert");
			this.toggleButton.setAttribute("aria-expanded", "false");
			this.toggleButton.hidden = true;
			this.navElement.classList.remove("is-open");
			this.toggleButton.classList.remove("is-open");
			this.restoreScroll();
			this.isOpen = false;
		} else {
			this.navElement.setAttribute("aria-hidden", "true");
			this.navElement.setAttribute("inert", "");
			this.toggleButton.setAttribute("aria-expanded", "false");
			this.toggleButton.hidden = false;
			this.navElement.classList.remove("is-open");
			this.toggleButton.classList.remove("is-open");
			this.restoreScroll();
			this.isOpen = false;
		}
	}

	private handleMediaChange(): void {
		this.applyViewportState();
	}

	private setupEventListeners(): void {
		this.toggleButton.addEventListener("click", this.boundHandleToggle);

		if (this.options.closeOnLinkClick) {
			const links = this.navElement.querySelectorAll("a");
			links.forEach((link) => {
				link.addEventListener("click", () => {
					if (!this.isDesktop()) {
						this.close();
					}
				});
			});
		}

		document.addEventListener("keydown", this.boundHandleEscape);
		this.mq.addEventListener("change", this.boundHandleMediaChange);
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
		if (this.isOpen || this.isDesktop()) return;

		this.options.beforeOpen();
		this.preventScroll();

		this.navElement.classList.add("is-open");
		this.toggleButton.classList.add("is-open");
		this.navElement.setAttribute("aria-hidden", "false");
		this.navElement.removeAttribute("inert");
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
		this.navElement.setAttribute("inert", "");
		this.toggleButton.setAttribute("aria-expanded", "false");

		this.restoreScroll();

		this.isOpen = false;
		this.options.afterClose();
	}

	public toggle(): void {
		if (this.isDesktop()) return;

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
		this.toggleButton.removeEventListener("click", this.boundHandleToggle);
		document.removeEventListener("keydown", this.boundHandleEscape);
		this.mq.removeEventListener("change", this.boundHandleMediaChange);
	}
}

export const createNav = (
	navSelector: string,
	toggleSelector: string,
	options?: NavOptions,
): Nav | null => {
	if (!document.querySelector(navSelector)) return null;
	if (!document.querySelector(toggleSelector)) return null;
	return new Nav(navSelector, toggleSelector, options);
};

interface MegaMenuItem {
	item: HTMLElement;
	trigger: HTMLButtonElement;
	child: HTMLElement;
	isOpen: boolean;
	closeTimer: ReturnType<typeof setTimeout> | null;
}

interface MegaMenuOptions {
	desktopTrigger?: "hover" | "click";
	closeDelay?: number;
}

export class MegaMenu {
	private navElement: HTMLElement;
	private items: MegaMenuItem[] = [];
	private mq: MediaQueryList;
	private closeDelay: number;
	private desktopTrigger: "hover" | "click";
	private handlers: Map<HTMLElement, { enter: () => void; leave: () => void; click: () => void }> =
		new Map();
	private boundHandleEscape: (e: KeyboardEvent) => void;
	private boundHandleMediaChange: () => void;
	private boundHandleOutsideClick: (e: MouseEvent) => void;

	constructor(navSelector: string, options: MegaMenuOptions | number = {}) {
		const opts: MegaMenuOptions = typeof options === "number" ? { closeDelay: options } : options;
		const navEl = document.querySelector(navSelector) as HTMLElement;
		if (!navEl) throw new Error(`MegaMenu: element not found: ${navSelector}`);

		this.navElement = navEl;
		this.closeDelay = opts.closeDelay ?? 200;
		this.desktopTrigger = opts.desktopTrigger ?? "hover";
		this.mq = window.matchMedia("(min-width: 769px)");
		this.boundHandleEscape = this.handleEscapeKey.bind(this);
		this.boundHandleMediaChange = this.handleMediaChange.bind(this);
		this.boundHandleOutsideClick = this.handleOutsideClick.bind(this);

		this.init();
	}

	private init(): void {
		const listItems = this.navElement.querySelectorAll(".l-site-nav__list-item");

		listItems.forEach((li) => {
			const trigger = li.querySelector(":scope > [aria-controls]") as HTMLButtonElement | null;
			if (!trigger) return;

			const childId = trigger.getAttribute("aria-controls")!;
			const child = document.getElementById(childId);

			if (child) {
				trigger.setAttribute("aria-expanded", "false");
				child.setAttribute("aria-hidden", "true");
				child.setAttribute("inert", "");

				const menuItem: MegaMenuItem = {
					item: li as HTMLElement,
					trigger,
					child,
					isOpen: false,
					closeTimer: null,
				};

				this.setupItemListeners(menuItem);
				this.items.push(menuItem);
			}
		});

		document.addEventListener("keydown", this.boundHandleEscape);
		this.mq.addEventListener("change", this.boundHandleMediaChange);
		if (this.desktopTrigger === "click") {
			document.addEventListener("click", this.boundHandleOutsideClick);
		}
	}

	private setupItemListeners(menuItem: MegaMenuItem): void {
		const handleEnter = (): void => {
			if (!this.isDesktop()) return;
			this.cancelClose(menuItem);
			this.open(menuItem);
		};
		const handleLeave = (): void => {
			if (!this.isDesktop()) return;
			this.scheduleClose(menuItem);
		};
		const handleClick = (): void => {
			if (this.desktopTrigger === "hover" && this.isDesktop()) return;
			this.toggle(menuItem);
		};

		if (this.desktopTrigger === "hover") {
			menuItem.item.addEventListener("mouseenter", handleEnter);
			menuItem.item.addEventListener("mouseleave", handleLeave);
		}
		menuItem.trigger.addEventListener("click", handleClick);

		this.handlers.set(menuItem.item, {
			enter: handleEnter,
			leave: handleLeave,
			click: handleClick,
		});
	}

	private isDesktop(): boolean {
		return this.mq.matches;
	}

	private handleMediaChange(): void {
		this.closeAll();
	}

	private handleEscapeKey(event: KeyboardEvent): void {
		if (event.key === "Escape") {
			this.closeAll();
		}
	}

	private handleOutsideClick(event: MouseEvent): void {
		if (!this.isDesktop()) return;
		if (this.navElement.contains(event.target as Node)) return;
		this.closeAll();
	}

	private scheduleClose(menuItem: MegaMenuItem): void {
		this.cancelClose(menuItem);
		menuItem.closeTimer = setTimeout(() => {
			this.close(menuItem);
		}, this.closeDelay);
	}

	private cancelClose(menuItem: MegaMenuItem): void {
		if (menuItem.closeTimer !== null) {
			clearTimeout(menuItem.closeTimer);
			menuItem.closeTimer = null;
		}
	}

	private open(menuItem: MegaMenuItem): void {
		this.items.forEach((item) => {
			if (item !== menuItem) this.close(item);
		});

		if (menuItem.isOpen) return;

		menuItem.item.classList.add("is-open");
		menuItem.trigger.classList.add("is-open");
		menuItem.child.classList.add("is-open");
		menuItem.trigger.setAttribute("aria-expanded", "true");
		menuItem.child.setAttribute("aria-hidden", "false");
		menuItem.child.removeAttribute("inert");
		menuItem.isOpen = true;
	}

	private close(menuItem: MegaMenuItem): void {
		if (!menuItem.isOpen) return;

		this.cancelClose(menuItem);
		menuItem.item.classList.remove("is-open");
		menuItem.trigger.classList.remove("is-open");
		menuItem.child.classList.remove("is-open");
		menuItem.trigger.setAttribute("aria-expanded", "false");
		menuItem.child.setAttribute("aria-hidden", "true");
		menuItem.child.setAttribute("inert", "");
		menuItem.isOpen = false;
	}

	private toggle(menuItem: MegaMenuItem): void {
		if (menuItem.isOpen) {
			this.close(menuItem);
		} else {
			this.open(menuItem);
		}
	}

	public closeAll(): void {
		for (const item of this.items) this.close(item);
	}

	public destroy(): void {
		this.items.forEach((menuItem) => {
			this.cancelClose(menuItem);
			const h = this.handlers.get(menuItem.item);
			if (h) {
				if (this.desktopTrigger === "hover") {
					menuItem.item.removeEventListener("mouseenter", h.enter);
					menuItem.item.removeEventListener("mouseleave", h.leave);
				}
				menuItem.trigger.removeEventListener("click", h.click);
			}
		});
		document.removeEventListener("keydown", this.boundHandleEscape);
		this.mq.removeEventListener("change", this.boundHandleMediaChange);
		document.removeEventListener("click", this.boundHandleOutsideClick);
		this.handlers.clear();
		this.items = [];
	}
}

export const createMegaMenu = (
	navSelector: string,
	options?: MegaMenuOptions | number,
): MegaMenu | null => {
	if (!document.querySelector(navSelector)) return null;
	return new MegaMenu(navSelector, options);
};
