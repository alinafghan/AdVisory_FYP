import { Component } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { CampaignComponent } from '../../components/campaign/campaign.component';

@Component({
  selector: 'app-create-campaign-page',
  imports: [NavbarComponent, SidebarComponent, CampaignComponent],
  templateUrl: './create-campaign-page.component.html',
})
export class CreateCampaignPageComponent {

}
