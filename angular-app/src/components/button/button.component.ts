import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-button',
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css']
})
export class ButtonComponent {
  @Input() type: 'primary' | 'secondary' | 'accent' | 'outlined' = 'primary'; // Default type is primary
  @Input() label: string = 'Button'; // Default button label
  @Input() link: string = ''; 
  @Input() disabled: boolean = false; // Disabled state
}
