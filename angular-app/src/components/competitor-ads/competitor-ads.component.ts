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
    this.competitorAds = this.adDataService.getCompetitorAds();
    this.generatedAds = this.adDataService.getGeneratedAds();
    this.loadingCompetitorAds = false;
    this.loadingGeneratedAds = false;


      // You can merge the ads into one view if you want
    this.ads = [...this.competitorAds, ...this.generatedAds];
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