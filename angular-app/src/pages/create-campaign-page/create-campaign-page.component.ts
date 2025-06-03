import { Component } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { SidebarComponent } from '../../layout/component/app.sidebar';
import { CampaignComponent } from '../../reusable-components/campaign/campaign.component';

@Component({
  selector: 'app-create-campaign-page',
  imports: [NavbarComponent, SidebarComponent, CampaignComponent],
  templateUrl: './create-campaign-page.component.html',
})
export class CreateCampaignPageComponent {

}
