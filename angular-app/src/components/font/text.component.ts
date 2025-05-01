import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.css']
})
export class TextComponent {
  @Input() type: 'heading' | 'normal' | 'link' = 'normal';
  @Input() content: string = '';  
  @Input() linkHref: string = '';  
  @Input() extraClasses: string = '';  
}
