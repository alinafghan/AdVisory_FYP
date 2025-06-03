import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../../layout/component/app.sidebar';
import { LucideAngularModule, Route } from 'lucide-angular';
import { ArrowRight } from 'lucide-angular/src/icons';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppTopbar } from '../../layout/component/app.topbar';
import { CardWidget } from '../../layout/widgets/card-widget.component';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { CustomButtonComponent } from '../../layout/widgets/button-icon.component';

@Component({
  selector: 'app-manage-campaign',
  standalone: true,
  imports: [SidebarComponent, LucideAngularModule, CommonModule, RouterModule, AppTopbar, CardWidget, ButtonModule, TooltipModule, CustomButtonComponent],
  templateUrl: './manage-campaign.component.html',
})
export class ManageCampaignComponent implements OnInit {
  readonly ArrowRight = ArrowRight;

  campaigns: any[] = []; // Stores campaign IDs

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchCampaigns();
  }

  fetchCampaigns() {
    this.http.get<string[]>('http://localhost:3000/ads/getAllCampaigns').subscribe(
      (response) => {
        this.campaigns = response;
        console.log('Fetched campaigns:', response);
      },
      (error) => {
        console.error('Error fetching campaigns:', error);
      }
    );
  }

  // --- FIX START ---
  /**
   * Handles the click event for the 'Create New Campaign' button.
   * Although the button has a routerLink, this method can be used for
   * additional logic (e.g., analytics, opening a modal) if needed.
   * @param event The DOM event object.
   */
  onCreateCampaignClick(event: Event): void {
    console.log('Create New Campaign button clicked!', event);
    // You can add more logic here if necessary,
    // for example, to open a confirmation dialog or log an event.
  }
  // --- FIX END ---
}