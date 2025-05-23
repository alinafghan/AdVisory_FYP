import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { BudgetComponent } from '../../components/budget/budget.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-budget-page',
  imports: [FormsModule, CommonModule, SidebarComponent, NavbarComponent, BudgetComponent],
  templateUrl: './budget-page.component.html',
})
export class BudgetPageComponent {

}