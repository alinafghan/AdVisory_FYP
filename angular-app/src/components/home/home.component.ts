import { Component } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-home',
  imports: [SidebarComponent, NavbarComponent],
  templateUrl: './home.component.html',

})
export class HomeComponent {

}
