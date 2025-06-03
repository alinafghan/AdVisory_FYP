import { Component, Input, Output, EventEmitter } from '@angular/core'; // Import Output and EventEmitter if onManageButtonClick emits
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CustomButtonComponent } from './button-icon.component';

@Component({
  standalone: true,
  selector: 'app-card-widget',
  imports: [CommonModule, RouterModule, CustomButtonComponent], // Add CustomButtonComponent here
  template: `
    <div
      class="card mb-0 cursor-pointer hover:bg-opacity-80 transition duration-300 border border-gray-200 dark:border-gray-700 shadow-sm p-4"
      [routerLink]="routerLink"
      *ngIf="routerLink; else noRouterTemplate"
    >
      <div class="flex flex-col items-center mb-4">
        <span class="block text-muted-color font-medium mb-1 text-center">{{ title }}</span>
        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl text-center">{{ value }}</div>
      </div>
      <div class="flex justify-between items-center mt-2">
        <span class="text-primary font-medium" *ngIf="primaryText">{{ primaryText }}</span>
        <span class="text-sm text-gray-400" *ngIf="secondaryText">{{ secondaryText }}</span>
        <app-custom-button
          *ngIf="showManageButton"
          [label]="manageButtonText"
          [icon]="manageButtonIconClass"
          [buttonClass]="getManageButtonClass()"
          [routerLink]="manageButtonRouterLink"
          [tooltipText]="manageButtonTooltip"
          tooltipPosition="top"
          (onClick)="onManageButtonClick($event)"
        ></app-custom-button>
      </div>
    </div>

    <ng-template #noRouterTemplate>
      <div class="card mb-0 border border-gray-200 dark:border-gray-700 shadow-sm p-4">
        <div class="flex flex-col items-center mb-4">
          <span class="block text-muted-color font-medium mb-1 text-center">{{ title }}</span>
          <div class="text-surface-900 dark:text-surface-0 font-medium text-xl text-center">{{ value }}</div>
        </div>
        <div class="flex justify-between items-center mt-2">
          <span class="text-primary font-medium" *ngIf="primaryText">{{ primaryText }}</span>
          <span class="text-sm text-gray-400" *ngIf="secondaryText">{{ secondaryText }}</span>
          <app-custom-button
            *ngIf="showManageButton"
            [label]="manageButtonText"
            [icon]="manageButtonIconClass"
            [buttonClass]="getManageButtonClass()"
            [routerLink]="manageButtonRouterLink"
            [tooltipText]="manageButtonTooltip"
            tooltipPosition="top"
            (onClick)="onManageButtonClick($event)"
          ></app-custom-button>
        </div>
      </div>
    </ng-template>
  `,
})
export class CardWidget {
  @Input() title: string = '';
  @Input() value: string = '';
  @Input() primaryText?: string;
  @Input() secondaryText?: string; // <--- ADDED THIS LINE!
  @Input() routerLink?: string[];
  @Input() showManageButton: boolean = false;

  // Inputs for Manage Button Customization (now passed to app-custom-button)
  @Input() manageButtonText: string = 'Manage';
  @Input() manageButtonIconClass: string = 'pi pi-arrow-up-right';
  @Input() manageButtonBgColorClass: string = 'bg-blue-500 hover:bg-blue-600';
  @Input() manageButtonSizeClass: string = 'px-3 py-1 text-sm';
  @Input() manageButtonRouterLink?: string[];
  @Input() manageButtonTooltip: string = 'Manage campaign details';

  // If you intend for the parent component to react to the button click,
  // you might want to uncomment this @Output().
  // @Output() manageButtonClick = new EventEmitter<Event>();


  // Combine classes for the custom button
  getManageButtonClass(): string {
    const defaultStyles = 'rounded text-white flex items-center gap-1 transition duration-200';
    return `${defaultStyles} ${this.manageButtonBgColorClass} ${this.manageButtonSizeClass}`;
  }

  onManageButtonClick(event: Event) {
    // If you uncommented @Output(), you'd emit here:
    // this.manageButtonClick.emit(event);
    console.log('Manage button clicked from CardWidget!', event);
  }
}