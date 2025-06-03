import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LucideAngularModule, Plus } from 'lucide-angular';
import { CommonModule } from '@angular/common';
import { AdDataService } from '../../services/ad-data-service';
import { SidebarComponent } from '../../layout/component/app.sidebar';
import { AppTopbar } from '../../layout/component/app.topbar';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { CustomButtonComponent } from '../../layout/widgets/button-icon.component';

@Component({
  selector: 'app-selected-campaign',
  imports: [
    SidebarComponent, 
    LucideAngularModule, 
    CommonModule, 
    RouterModule, 
    AppTopbar, 
    ButtonModule, 
    TooltipModule, 
    CustomButtonComponent
  ],
  templateUrl: './selected-campaign.component.html'
})
export class SelectedCampaignComponent implements OnInit {
  campaignId!: string;
  campaign: any;
  ads: any[] = [];
  isAnalyzing: boolean = false;

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router, private adDataService: AdDataService) {}

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
          this.ads.forEach(ad => {
            console.log('Ad ID in Selected Campaign:', ad?._id);
          });
        },
        error: (err) => {
          console.error('Error fetching ads:', err);
        },
      });
  }

  runCompetitorAnalysis() {
    if (!this.campaign?.keywords?.length) {
      console.error('No keyword found');
      return;
    }

    this.isAnalyzing = true;

    const keyword = Array.isArray(this.campaign.keywords)
      ? this.campaign.keywords[0]
      : this.campaign.keywords;

    const adGenerationPayload = {
      keyword,
      businessName: this.campaign.businessName || 'Unnamed Business',
      businessType: this.campaign.industry || 'general',
      campaignName: this.campaign.campaignName,
      campaignFocus: this.campaign.campaignFocus || 'branding'
    };

    // Show loading UI before data returns
    this.adDataService.setCompetitorAds([]);
    this.adDataService.setGeneratedAds([]);

    // Call API first
    this.http.post('http://localhost:3000/generate-inspired-ads/get', adGenerationPayload).subscribe(
      (res: any) => {
        console.log('🎨 Inspired ads response:', res);

        this.adDataService.setCompetitorAds(res.competitorAds || []);
        this.adDataService.setGeneratedAds(res.generatedAds || []);
        this.isAnalyzing = false;

        // ✅ Now that data is stored, navigate
        this.router.navigate(['/competitor-ads']);
      },
      (err) => {
        console.error('❌ Error generating ads:', err);
        this.isAnalyzing = false;
        alert('Failed to analyze competitor ads.');
      }
    );
  }
}