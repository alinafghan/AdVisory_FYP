import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { BudgetComponent } from '../budget/budget.component';

@Component({
  selector: 'app-budget-page',
  imports: [FormsModule, CommonModule, SidebarComponent, NavbarComponent, BudgetComponent],
  templateUrl: './budget-page.component.html',
})
export class BudgetPageComponent {

}