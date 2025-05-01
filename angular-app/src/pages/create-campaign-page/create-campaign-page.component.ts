import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CampaignComponent } from '../campaign/campaign.component';

@Component({
  selector: 'app-create-campaign-page',
  imports: [NavbarComponent, SidebarComponent, CampaignComponent],
  templateUrl: './create-campaign-page.component.html',
})
export class CreateCampaignPageComponent {

}
