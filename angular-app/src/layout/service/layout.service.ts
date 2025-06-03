// layout.service.ts
import { Injectable, effect, signal, computed } from '@angular/core';
import { Subject } from 'rxjs';

export interface layoutConfig {
    preset?: string;
    primary?: string;
    surface?: string | undefined | null;
    darkTheme?: boolean;
    menuMode?: string; // 'static' or 'overlay'
}

interface LayoutState {
    staticMenuDesktopInactive?: boolean; // For desktop static menu: true means collapsed/hidden
    overlayMenuActive?: boolean;         // For overlay menu: true means visible
    configSidebarVisible?: boolean;
    staticMenuMobileActive?: boolean;    // For mobile menu: true means visible
    menuHoverActive?: boolean;
}

interface MenuChangeEvent {
    key: string;
    routeEvent?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class LayoutService {
    _config: layoutConfig = {
        preset: 'Aura',
        primary: 'emerald',
        surface: null,
        darkTheme: false,
        menuMode: 'static' // Initial mode
    };

    _state: LayoutState = {
        staticMenuDesktopInactive: false, // Initially active (visible) on desktop static
        overlayMenuActive: false,         // Initially hidden
        configSidebarVisible: false,
        staticMenuMobileActive: false,    // Initially hidden
        menuHoverActive: false
    };

    layoutConfig = signal<layoutConfig>(this._config);
    layoutState = signal<LayoutState>(this._state);

    private configUpdate = new Subject<layoutConfig>();
    private overlayOpen = new Subject<any>();
    private menuSource = new Subject<MenuChangeEvent>();
    private resetSource = new Subject();

    menuSource$ = this.menuSource.asObservable();
    resetSource$ = this.resetSource.asObservable();
    configUpdate$ = this.configUpdate.asObservable();
    overlayOpen$ = this.overlayOpen.asObservable();

    theme = computed(() => (this.layoutConfig()?.darkTheme ? 'light' : 'dark'));

    // isSidebarActive should only be true when an overlay/mobile menu is truly active and needs a mask
    isSidebarActive = computed(() => {
        const state = this.layoutState();
        const config = this.layoutConfig();
        // Mask is active if it's an overlay menu (desktop) OR a mobile menu (static or overlay)
        return (config.menuMode === 'overlay' && state.overlayMenuActive) || state.staticMenuMobileActive;
    });

    isDarkTheme = computed(() => this.layoutConfig().darkTheme);
    getPrimary = computed(() => this.layoutConfig().primary);
    getSurface = computed(() => this.layoutConfig().surface);

    // Renamed for clarity: isOverlay is true if menuMode is 'overlay'
    isOverlay = computed(() => this.layoutConfig().menuMode === 'overlay');
    isStatic = computed(() => this.layoutConfig().menuMode === 'static'); // Added for clarity

    transitionComplete = signal<boolean>(false);
    private initialized = false;

    constructor() {
        effect(() => {
            const config = this.layoutConfig();
            if (config) {
                this.onConfigUpdate();
            }
        });

        effect(() => {
            const config = this.layoutConfig();

            if (!this.initialized || !config) {
                this.initialized = true;
                return;
            }

            this.handleDarkModeTransition(config);
        });
    }

    private handleDarkModeTransition(config: layoutConfig): void {
        if ((document as any).startViewTransition) {
            this.startViewTransition(config);
        } else {
            this.toggleDarkMode(config);
            this.onTransitionEnd();
        }
    }

    private startViewTransition(config: layoutConfig): void {
        const transition = (document as any).startViewTransition(() => {
            this.toggleDarkMode(config);
        });

        transition.ready
            .then(() => {
                this.onTransitionEnd();
            })
            .catch(() => {});
    }

    toggleDarkMode(config?: layoutConfig): void {
        const _config = config || this.layoutConfig();
        if (_config.darkTheme) {
            document.documentElement.classList.add('app-dark');
        } else {
            document.documentElement.classList.remove('app-dark');
        }
    }

    private onTransitionEnd() {
        this.transitionComplete.set(true);
        setTimeout(() => {
            this.transitionComplete.set(false);
        });
    }

    // REVISED onMenuToggle logic
    onMenuToggle() {
        const currentLayoutConfig = this.layoutConfig();
        const currentLayoutState = this.layoutState();

        if (this.isDesktop()) {
            if (currentLayoutConfig.menuMode === 'static') {
                // Desktop Static Mode: Toggle staticMenuDesktopInactive
                this.layoutState.update((prev) => ({
                    ...prev,
                    staticMenuDesktopInactive: !prev.staticMenuDesktopInactive,
                    overlayMenuActive: false, // Ensure overlay is off
                    staticMenuMobileActive: false // Ensure mobile is off
                }));
            } else if (currentLayoutConfig.menuMode === 'overlay') {
                // Desktop Overlay Mode: Toggle overlayMenuActive
                this.layoutState.update((prev) => ({
                    ...prev,
                    overlayMenuActive: !prev.overlayMenuActive,
                    staticMenuDesktopInactive: false, // Ensure static is off
                    staticMenuMobileActive: false // Ensure mobile is off
                }));
                if (!currentLayoutState.overlayMenuActive) { // If it's about to open
                    this.overlayOpen.next(null); // Trigger overlay open event
                }
            }
        } else { // Mobile (behaves like an overlay regardless of menuMode)
            this.layoutState.update((prev) => ({
                ...prev,
                staticMenuMobileActive: !prev.staticMenuMobileActive,
                overlayMenuActive: false, // Ensure desktop overlay is off
                staticMenuDesktopInactive: false // Ensure static desktop is off
            }));
            if (!currentLayoutState.staticMenuMobileActive) { // If it's about to open
                this.overlayOpen.next(null); // Trigger overlay open event
            }
        }
    }

    isDesktop() {
        return window.innerWidth > 991;
    }

    isMobile() {
        return !this.isDesktop();
    }

    onConfigUpdate() {
        this._config = { ...this.layoutConfig() };
        this.configUpdate.next(this.layoutConfig());
    }

    onMenuStateChange(event: MenuChangeEvent) {
        this.menuSource.next(event);
    }

    reset() {
        this.resetSource.next(true);
    }
}