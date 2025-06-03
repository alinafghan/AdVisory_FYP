import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import {
  Bell, // For notifications
  ChevronDown, // For dropdown arrow
  Search, // For search bar
  Settings, // For profile dropdown item
  LogOut, // For profile dropdown item
  User, // For profile icon
} from 'lucide-angular';

@Component({
  selector: 'app-loggedin-navbar', // Renamed for consistency
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule, // Important for using Lucide icons
  ],
  templateUrl: './loggedin-navbar.component.html',
  styleUrls: ['./loggedin-navbar.component.css'], // Or .scss if you prefer
})
export class LoggedInNavbarComponent implements OnInit {
  // Expose Lucide icons to the template
  readonly Bell = Bell;
  readonly ChevronDown = ChevronDown;
  readonly Search = Search;
  readonly Settings = Settings;
  readonly LogOut = LogOut;
  readonly User = User; // For default profile icon

  isProfileDropdownOpen = false; // State for the profile dropdown

  constructor() {}

  ngOnInit(): void {
    // You can fetch user data here if needed for the profile section
  }

  toggleProfileDropdown(): void {
    this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
  }

  // Optional: Close dropdown when clicking outside
  // You might add a global click listener in a base component or a service
  // to close all dropdowns when clicking anywhere else.
  // For simplicity, we'll rely on toggling for now.
}