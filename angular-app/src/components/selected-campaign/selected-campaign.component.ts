import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LucideAngularModule } from 'lucide-angular';
import { CommonModule } from '@angular/common';
import { PlusIcon } from 'lucide-angular';

@Component({
  selector: 'app-selected-campaign',
  imports: [SidebarComponent, LucideAngularModule, CommonModule, RouterModule],
  templateUrl: './selected-campaign.component.html'
})
export class SelectedCampaignComponent implements OnInit {
  readonly plusIcon = PlusIcon;
  campaignId!: string;
  campaign: any;
  ads: any[] = [];

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    this.campaignId = this.route.snapshot.paramMap.get('campaignId')!;
    console.log('Selected Campaign ID:', this.campaignId);
    this.fetchCampaignDetails();
  }

  fetchCampaignDetails() {
    this.http
      .get(`http://localhost:3000/ads/getCampaign/${this.campaignId}`)
      .subscribe({
        next: (response: any) => {
          this.campaign = response.campaign;
          console.log('Campaign:', this.campaign);
          this.fetchAdsForCampaign(); // Call ads fetch after campaign is fetched
        },
        error: (err) => {
          console.error('Error fetching campaign:', err);
        },
      });
  }

  fetchAdsForCampaign() {
    this.http
      .post<any[]>('http://localhost:3000/ads/getAdsFromCampaign', {
        campaignId: this.campaignId,
      })
      .subscribe({
        next: (response) => {
          this.ads = response;
          console.log('Ads:', this.ads);
        },
        error: (err) => {
          console.error('Error fetching ads:', err);
        },
      });
  }
}