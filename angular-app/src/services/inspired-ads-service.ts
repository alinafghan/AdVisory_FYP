import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

export interface Campaign {
  campaignId: string;
  businessId: string;
  campaignName: string;
  industry: string;
  platform: string;
  duration: string;
  keywords: string;
  campaignFocus: string;
  businessName?: string;
}

export interface CompetitorAd {
  id: string;
  page_name: string;
  page_categories: string[];
  body_text: string;
  social_links: any[];
  page_profile_picture_url: string;
  images: AdImage[];
}

export interface AdImage {
  id: string;
  url: string;
  local_path: string;
  filename: string;
  ad_id: string;
  timestamp: string;
}

export interface GeneratedAdIdea {
  image_prompt: string;
  caption: string;
  imageBase64?: string;
}

export interface InspiredAdsResponse {
  ideas: GeneratedAdIdea[];
  storedCount: number;
  success: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  stage: 'idle' | 'fetching_competitors' | 'generating_ads' | 'complete';
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class InspiredAdsService {
  private apiUrl = 'http://localhost:3000';
  
  // Loading state management
  private loadingStateSubject = new BehaviorSubject<LoadingState>({
    isLoading: false,
    stage: 'idle',
    message: ''
  });
  
  public loadingState$ = this.loadingStateSubject.asObservable();
  
  // Data storage
  private competitorAdsSubject = new BehaviorSubject<CompetitorAd[]>([]);
  private generatedAdsSubject = new BehaviorSubject<GeneratedAdIdea[]>([]);
  
  public competitorAds$ = this.competitorAdsSubject.asObservable();
  public generatedAds$ = this.generatedAdsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Generate inspired ads based on campaign data
   */
  async generateInspiredAds(campaign: Campaign): Promise<InspiredAdsResponse> {
    try {
      // Set initial loading state
      this.updateLoadingState(true, 'fetching_competitors', 
        'Fetching competitor ads based on your campaign and business...');

      // Prepare request payload
      const payload = {
        keywords: campaign.keywords,
        businessName: campaign.campaignName, // Using campaign name as business name
        businessType: campaign.industry,
        campaignName: campaign.campaignName,
        campaignFocus: campaign.campaignFocus
      };

      console.log('Sending request to generate inspired ads:', payload);

      // Make API call
      const response = await this.http.post<InspiredAdsResponse>(
        `${this.apiUrl}/generate-inspired-ads/get`,
        payload
      ).toPromise();

      if (!response) {
        throw new Error('No response received from server');
      }

      // Update loading state to generating phase
      this.updateLoadingState(true, 'generating_ads', 
        'Generating inspired ads based on competitor analysis...');

      // Simulate additional loading time for image generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Store the results
      this.generatedAdsSubject.next(response.ideas || []);
      
      // Complete loading
      this.updateLoadingState(false, 'complete', 'Ads generated successfully!');
      
      return response;

    } catch (error) {
      console.error('Error generating inspired ads:', error);
      this.updateLoadingState(false, 'idle', '');
      throw error;
    }
  }

  /**
   * Fetch competitor ads separately (optional)
   */
  async fetchCompetitorAds(keywords: string): Promise<CompetitorAd[]> {
    try {
      this.updateLoadingState(true, 'fetching_competitors', 
        'Searching for competitor ads...');

      const response = await this.http.post<{ads: CompetitorAd[]}>(
        `${this.apiUrl}/competitor-ads/scrape-facebook-ads`,
        { keywords }
      ).toPromise();

      const ads = response?.ads || [];
      this.competitorAdsSubject.next(ads);
      this.updateLoadingState(false, 'complete', 'Competitor ads loaded!');
      
      return ads;
    } catch (error) {
      console.error('Error fetching competitor ads:', error);
      this.updateLoadingState(false, 'idle', '');
      throw error;
    }
  }

  /**
   * Update loading state
   */
  private updateLoadingState(isLoading: boolean, stage: LoadingState['stage'], message: string) {
    this.loadingStateSubject.next({
      isLoading,
      stage,
      message
    });
  }

  /**
   * Reset service state
   */
  resetState(): void {
    this.competitorAdsSubject.next([]);
    this.generatedAdsSubject.next([]);
    this.loadingStateSubject.next({
      isLoading: false,
      stage: 'idle',
      message: ''
    });
  }

  /**
   * Get current loading state
   */
  getCurrentLoadingState(): LoadingState {
    return this.loadingStateSubject.value;
  }

  /**
   * Get current competitor ads
   */
  getCurrentCompetitorAds(): CompetitorAd[] {
    return this.competitorAdsSubject.value;
  }

  /**
   * Get current generated ads
   */
  getCurrentGeneratedAds(): GeneratedAdIdea[] {
    return this.generatedAdsSubject.value;
  }
}