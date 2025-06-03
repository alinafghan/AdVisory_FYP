import { Component } from '@angular/core';
import { SidebarComponent } from '../../layout/component/app.sidebar';
import { LoggedInNavbarComponent } from '../../components/loggedin-navbar/loggedin-navbar.component';
import { LucideAngularModule } from 'lucide-angular/src/icons';
import { ArrowRight } from 'lucide-angular';
import {
	HlmTabsComponent,
	HlmTabsContentDirective,
	HlmTabsListComponent,
	HlmTabsTriggerDirective,
} from '@spartan-ng/ui-tabs-helm';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SidebarComponent, LucideAngularModule,  LoggedInNavbarComponent],
  templateUrl: './home.component.html',

})
export class HomeComponent {
  readonly ArrowRight = ArrowRight;


  activeTab: string = 'account';


  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}
