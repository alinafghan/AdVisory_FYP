import { Component, Renderer2, ElementRef, OnInit } from '@angular/core';

@Component({
  selector: 'app-dark-mode-toggle',
  templateUrl: './dark-mode-toggle.component.html',
  styleUrls: ['./dark-mode-toggle.component.css']
})
export class DarkModeToggleComponent implements OnInit {
  isDarkMode = true; // Default to dark mode

  constructor(private renderer: Renderer2, private el: ElementRef) {}

  ngOnInit(): void {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'light') {
      this.enableLightMode();
    } else {
      this.enableDarkMode();
    }
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      this.enableDarkMode();
      localStorage.setItem('theme', 'dark');
    } else {
      this.enableLightMode();
      localStorage.setItem('theme', 'light');
    }
  }

  enableDarkMode(): void {
    this.renderer.removeClass(document.body, 'light');
  }

  enableLightMode(): void {
    this.renderer.addClass(document.body, 'light');
  }
}