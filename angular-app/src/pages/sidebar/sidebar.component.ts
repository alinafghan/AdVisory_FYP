import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Home, SquareDashedMousePointer, User, Settings, X, Circle, ArrowLeft, Globe , LogOut} from 'lucide-angular';

@Component({
  selector: 'app-sidebar',
  imports: [LucideAngularModule, CommonModule],
  templateUrl: './sidebar.component.html',
})



export class SidebarComponent {
  readonly User = User;
  readonly Settings = Settings;
  readonly Home = Home;
  readonly SquareDashedMousePointer = SquareDashedMousePointer;
  readonly Logout = LogOut;
  readonly ArrowLeft = ArrowLeft;
  readonly Circle = Circle;
  readonly X = X;
  readonly Globe = Globe;

  navItems = [
    { label: 'AdVisory', link: '#', icon: this.ArrowLeft },
    { label: 'Campaign Manager', link: '/manage_campaign', icon: this.SquareDashedMousePointer },
    { label: 'Explore more', link: '#', icon: this.Globe },
    { label: 'Account Settings', link: '/settings', icon: this.Settings },
    { label: 'Profile', link: '/profile', icon: this.User },
  ];  

  isSidebarExpanded = false;
  isSidebarLocked = false;

  onMouseEnter() {
    if (!this.isSidebarLocked) {
      this.isSidebarExpanded = true;
    }
  }

  onMouseLeave() {
    if (!this.isSidebarLocked) {
      this.isSidebarExpanded = false;
    }
  }

  toggleSidebarLock() {
    this.isSidebarLocked = !this.isSidebarLocked;
    this.isSidebarExpanded = this.isSidebarLocked;
  }

  
}

