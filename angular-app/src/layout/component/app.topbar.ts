import { Component, ViewChild, ElementRef } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, AppConfigurator],
    template: ` <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
                        <a class="layout-topbar-logo" routerLink="/">
                <img src="assets/logos/advisory-high-resolution-logo-transparent.png" 
                     alt="AdVisory Logo" 
                     style="height: 40px; width: auto;">
            </a>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                    <i [ngClass]="{ 'pi ': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
                </button>
                <div class="relative">
                    <button
                        #configButton
                        class="layout-topbar-action layout-topbar-action-highlight"
                        pStyleClass="#configurator"
                        enterFromClass="hidden"
                        enterActiveClass="animate-scalein"
                        leaveToClass="hidden"
                        leaveActiveClass="animate-fadeout"
                        [hideOnOutsideClick]="true"
                        (click)="onConfiguratorToggle()"
                    >
                        <i class="pi pi-palette"></i>
                    </button>
                    <app-configurator 
                        #configurator
                        id="configurator"
                        class="hidden"
                        (configuratorClosed)="onConfiguratorClosed()"
                    />
                </div>
            </div>

            <button class="layout-topbar-menu-button layout-topbar-action" pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <button type="button" class="layout-topbar-action">
                        <i class="pi pi-calendar"></i>
                        <span>Calendar</span>
                    </button>
                    <button type="button" class="layout-topbar-action">
                        <i class="pi pi-inbox"></i>
                        <span>Messages</span>
                    </button>
                    <button type="button" class="layout-topbar-action">
                        <i class="pi pi-user"></i>
                        <span>Profile</span>
                    </button>
                </div>
            </div>
        </div>
    </div>`
})
export class AppTopbar {
    @ViewChild('configurator') configurator!: ElementRef;
    @ViewChild('configButton') configButton!: ElementRef;
    
    items!: MenuItem[];
    isConfiguratorOpen = false;

    constructor(public layoutService: LayoutService) {}

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }

    onConfiguratorToggle() {
        this.isConfiguratorOpen = !this.isConfiguratorOpen;
        
        if (!this.isConfiguratorOpen && this.configurator) {
            // Manually close the configurator
            this.configurator.nativeElement.classList.add('hidden');
            this.configurator.nativeElement.classList.remove('animate-scalein');
        }
    }

    onConfiguratorClosed() {
        this.isConfiguratorOpen = false;
    }
}