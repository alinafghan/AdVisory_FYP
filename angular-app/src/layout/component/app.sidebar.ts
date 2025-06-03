// app.sidebar.ts
import { Component, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule for ngClass
import { AppMenu } from './app.menu';
import { LayoutService } from '../service/layout.service'; // Import LayoutService

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [AppMenu, CommonModule], // Add CommonModule
    template: `
        <div class="layout-sidebar"
             [ngClass]="{
                 'layout-sidebar-static-desktop-inactive': layoutService.layoutState().staticMenuDesktopInactive,
                 'layout-sidebar-overlay-active': layoutService.layoutState().overlayMenuActive,
                 'layout-sidebar-static-mobile-active': layoutService.layoutState().staticMenuMobileActive
             }">
             <app-menu></app-menu>
        </div>
    `
})
export class SidebarComponent {
    layoutService = inject(LayoutService); // Inject LayoutService

    constructor(public el: ElementRef) {}
}