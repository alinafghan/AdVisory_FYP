import { Component } from '@angular/core';
import { LucideAngularModule, FileIcon } from 'lucide-angular';

@Component({
  selector: 'app-navbar',
  standalone: true, 
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [LucideAngularModule]
})
export class NavbarComponent {
  readonly FileIcon = FileIcon;

}