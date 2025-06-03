import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // For routerLink support
import { ButtonModule } from 'primeng/button'; // Assuming you want PrimeNG pButton features
import { TooltipModule } from 'primeng/tooltip'; // For tooltip support

@Component({
  standalone: true,
  selector: 'app-custom-button',
  imports: [CommonModule, RouterModule, ButtonModule, TooltipModule], // Import PrimeNG modules if using
  template: `
    <button
      pButton                         type="button"
      [label]="label"
      [icon]="icon"
      [iconPos]="iconPosition"
      [class]="buttonClass"          [ngStyle]="buttonStyles"       [routerLink]="routerLink"      [pTooltip]="tooltipText"       [tooltipPosition]="tooltipPosition"
      (click)="onClick.emit($event)" ></button>
  `,
  styles: [`
    /* Add any default or base styles here if necessary, though Tailwind classes are preferred */
  `]
})
export class CustomButtonComponent {
  @Input() label: string = '';
  @Input() icon: string = ''; // e.g., 'pi pi-plus', 'pi pi-arrow-up-right'
  @Input() iconPosition: 'left' | 'right' | 'top' | 'bottom' = 'left';
  @Input() buttonClass: string = ''; // For Tailwind CSS classes: 'bg-blue-500 hover:bg-blue-600 px-3 py-1 text-sm'
  @Input() buttonStyles: { [key: string]: string } = {}; // For inline styles like { 'background-color': '#0f0f14' }
  @Input() routerLink?: any[] | string | null; // Supports various routerLink formats
  @Input() tooltipText: string = '';
  @Input() tooltipPosition: 'top' | 'bottom' | 'left' | 'right' = 'top';

  @Output() onClick = new EventEmitter<Event>(); // Emit a click event
}