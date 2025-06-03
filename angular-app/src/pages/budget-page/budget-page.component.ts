import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import { SidebarComponent } from '../../layout/component/app.sidebar';
import { BudgetComponent } from '../../reusable-components/budget/budget.component';
import { CommonModule } from '@angular/common';
import { AppTopbar } from '../../layout/component/app.topbar';

@Component({
  selector: 'app-budget-page',
  imports: [FormsModule, CommonModule, SidebarComponent, BudgetComponent,  AppTopbar],
  templateUrl: './budget-page.component.html',
})
export class BudgetPageComponent {

}