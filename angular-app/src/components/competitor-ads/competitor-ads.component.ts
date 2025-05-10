import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { FormsModule } from '@angular/forms';

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
  imports: [CommonModule, SidebarComponent, RouterModule, LucideAngularModule, FormsModule],
  templateUrl: './competitor-ads.component.html',
  styleUrls: ['./competitor-ads.component.scss']
})
export class CompetitorAdsComponent implements OnInit {
  ads: FacebookAd[] = [];
  loading = false;
  error: string | null = null;
  keyword = '';
  
  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    // Don't auto-fetch on init since we need a keyword
  }

  fetchAds(): void {
    if (!this.keyword.trim()) {
      this.error = 'Please enter a keyword to search for ads';
      return;
    }
    
    this.loading = true;
    this.error = null;
    
    // Pass the keyword to the backend endpoint
    this.http.post<FacebookAd[]>('http://localhost:5000/scrape-facebook-ads', { keyword: this.keyword })
      .subscribe({
        next: (data) => {
          this.ads = data;
          this.loading = false;
          console.log('Fetched ads:', data);
        },
        error: (err) => {
          console.error('Error fetching Facebook ads:', err);
          this.error = err.error?.error || 'Failed to load competitor ads. Please try again later.';
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