import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface SocialLinks {
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  twitter?: string;
  youtube?: string;
}

interface FacebookAd {
  body_text: string;
  social_links: SocialLinks;
  page_categories: string[];
  page_name: string;
  page_profile_picture_url: string;
  original_image_urls?: string[];
  video_preview_image_urls?: string[];
}

@Component({
  selector: 'app-competitor-ads',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './competitor-ads.component.html',
  styleUrls: ['./competitor-ads.component.scss']
})
export class CompetitorAdsComponent implements OnInit {
  ads: FacebookAd[] = [];
  loading = false;
  error: string | null = null;
  
  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.fetchAds();
  }

  fetchAds(): void {
    this.loading = true;
    this.error = null;
    
    this.http.post<FacebookAd[]>('/api/scrape-facebook-ads', {})
      .subscribe({
        next: (data) => {
          this.ads = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching Facebook ads:', err);
          this.error = 'Failed to load competitor ads. Please try again later.';
          this.loading = false;
        }
      });
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
  
  // Helper method to use Object.entries in template
  objectEntries(obj: any): [string, any][] {
    return Object.entries(obj);
  }
}