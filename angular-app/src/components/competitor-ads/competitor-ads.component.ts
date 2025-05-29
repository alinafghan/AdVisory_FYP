import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { AdDataService } from '../../services/ad-data-service';

@Component({
  selector: 'app-competitor-ads',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, FormsModule],
  templateUrl: './competitor-ads.component.html',
  styleUrls: ['./competitor-ads.component.scss']
})
export class CompetitorAdsComponent implements OnInit {
  competitorAds: any[] = [];
  generatedAds: any[] = [];
  
  loadingCompetitorAds = true;
  loadingGeneratedAds = true;


  // Fixes for binding in HTML
  ads: any[] = [];  // you can combine both here if needed
  keywords: string = '';
  loading: boolean = false;
  error: string | null = null;

  constructor(private adDataService: AdDataService) {}

  ngOnInit(): void {
    //JUST THIS
  // this.competitorAds = this.adDataService.getCompetitorAds() || [];
  // this.generatedAds = this.adDataService.getGeneratedAds() || [];
  // this.loadingCompetitorAds = false;
  // this.loadingGeneratedAds = false;
  const loadedCompetitors = this.adDataService.getCompetitorAds();
  const loadedGenerated = this.adDataService.getGeneratedAds();

  this.loadingCompetitorAds = !loadedCompetitors || loadedCompetitors.length === 0;
  this.loadingGeneratedAds = !loadedGenerated || loadedGenerated.length === 0;

  this.competitorAds = loadedCompetitors || [];
  this.generatedAds = loadedGenerated || [];

  // Watch for delayed updates (optional: use RxJS Subject for smarter updates)
  setTimeout(() => {
    const checkUpdates = () => {
      const newCompetitors = this.adDataService.getCompetitorAds();
      const newGenerated = this.adDataService.getGeneratedAds();

      if (this.loadingCompetitorAds && newCompetitors.length > 0) {
        this.competitorAds = newCompetitors;
        this.loadingCompetitorAds = false;
      }

      if (this.loadingGeneratedAds && newGenerated.length > 0) {
        this.generatedAds = newGenerated;
        this.loadingGeneratedAds = false;
      }

      if (this.loadingCompetitorAds || this.loadingGeneratedAds) {
        setTimeout(checkUpdates, 1000); // poll every second
      }
    };

    checkUpdates();
  }, 500);
  }

  objectEntries(obj: any): [string, any][] {
    return Object.entries(obj || {});
  }

  getSocialPlatformIcon(platform: string): string {
    const icons: { [key: string]: string } = {
      'instagram': 'bi bi-instagram',
      'facebook': 'bi bi-facebook',
      'linkedin': 'bi bi-linkedin',
      'twitter': 'bi bi-twitter',
      'youtube': 'bi bi-youtube'
    };
    return icons[platform] || 'bi bi-link-45deg';
  }
}