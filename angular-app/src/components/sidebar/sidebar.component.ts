import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  HomeIcon,
  SettingsIcon,
  UsersIcon,
  LogOutIcon,
  XIcon,
  ArrowLeftIcon,
  ArrowRight,
  CircleIcon,
  // Added imports
  LayoutDashboard,
  ShoppingCart,
  LayoutDashboardIcon,
  ArrowRightIcon
} from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { RouterModule } from '@angular/router';

interface NavItem {
  icon: any; // Change icon type to string
  label: string;
  link: string;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [CommonModule, LucideAngularModule, RouterModule],
  standalone: true,
})
export class SidebarComponent implements OnInit, OnDestroy {
  // Icon names as strings
  Home = HomeIcon;
  Settings = SettingsIcon;
  LogOut = LogOutIcon;
  X = XIcon;
  Circle = CircleIcon;
  ChevronLeft = ArrowLeftIcon;
  ChevronRight = ArrowRightIcon;
  CampaignManagerIcon = ShoppingCart;
  ExploreMoreIcon = LayoutDashboardIcon;

  isExpanded = true;
  isLocked = false;
  hoverTimer: any = null;

  navItems: NavItem[] = [
    { icon: this.Home, label: 'Home', link: '/home' },
    { icon: this.Settings, label: 'Settings', link: '/settings' },
    { icon: this.LogOut, label: 'Logout', link: '/logout' },
    { icon: this.X, label: 'Close', link: '/close' },
    { icon: this.ChevronLeft, label: 'Collapse', link: '/collapse' },
    { icon: this.ChevronRight, label: 'Expand', link: '/expand' },
    { icon: this.Circle, label: 'Circle', link: '/circle' },
    { icon: this.CampaignManagerIcon, label: 'Campaign Manager', link: '/manage_campaign' },
    { icon: this.ExploreMoreIcon, label: 'Explore More', link: '/explore' },
  ];

  constructor() {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    if (this.hoverTimer) {
      clearTimeout(this.hoverTimer);
    }
  }

  clearHoverTimer(): void {
    if (this.hoverTimer) {
      clearTimeout(this.hoverTimer);
      this.hoverTimer = null;
    }
  }

  handleMouseEnter(): void {
    if (!this.isLocked && !this.isExpanded) {
      this.clearHoverTimer(); // Clear any existing timer
      this.isExpanded = true; // Expand immediately
    }
  }

  handleMouseLeave(): void {
    if (!this.isLocked && this.isExpanded) {
      this.clearHoverTimer(); // Clear timer
      this.isExpanded = false; // Collapse immediately
    }
  }

  toggleLock(): void {
    this.isLocked = !this.isLocked;
  }

  toggleSidebar(): void {
    this.isExpanded = !this.isExpanded;
    this.isLocked = !this.isExpanded;
  }
}
