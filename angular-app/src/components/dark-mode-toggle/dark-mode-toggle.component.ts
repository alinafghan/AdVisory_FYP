import { Component } from '@angular/core';

@Component({
  selector: 'app-dark-mode-toggle',
  templateUrl: './dark-mode-toggle.component.html',
  styleUrls: ['./dark-mode-toggle.component.css']
})
export class DarkModeToggleComponent {
  // This will toggle dark mode on the body
  toggleDarkMode(): void {
    document.body.classList.toggle('dark');
  }
}
