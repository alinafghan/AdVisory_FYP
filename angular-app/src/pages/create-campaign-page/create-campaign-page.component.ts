import { Component } from '@angular/core';
import { AppTopbar } from '../../layout/component/app.topbar';
import { SidebarComponent } from '../../layout/component/app.sidebar';
import { CampaignComponent } from '../../reusable-components/campaign/campaign.component';

@Component({
  selector: 'app-create-campaign-page',
  imports: [AppTopbar, SidebarComponent, CampaignComponent],
  templateUrl: './create-campaign-page.component.html',
})
export class CreateCampaignPageComponent {

}
