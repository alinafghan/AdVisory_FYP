import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface GeneratedAd {
  caption: string;
  imageBase64: string;
  id?: string;
  timestamp?: string;
}

export interface CompetitorAd {
  id: string;
  page_name: string;
  page_profile_picture_url: string;
  body_text: string;
  images: Array<{ url: string }>;
}

@Injectable({
  providedIn: 'root'
})
export class AdDataService {
  private competitorAds: CompetitorAd[] = [];
  private generatedAds: GeneratedAd[] = [];
  private adsForEditing: GeneratedAd[] = [];
  private adImageId: string = '';
  private currentJobId: string | null = null;
  private lastSearchParams: any = null;
  
  // Subjects for reactive updates
  private competitorAdsSubject = new BehaviorSubject<CompetitorAd[]>([]);
  private generatedAdsSubject = new BehaviorSubject<GeneratedAd[]>([]);
  private adsForEditingSubject = new BehaviorSubject<GeneratedAd[]>([]);

  constructor() {}
  setCurrentJobId(id: string) {
  this.currentJobId = id;
}
getCurrentJobId(): string | null {
  return this.currentJobId;
}
clearCurrentJobId() {
  this.currentJobId = null;
}
setLastSearchParams(params: any) {
  this.lastSearchParams = params;
}
getLastSearchParams(): any {
  return this.lastSearchParams;
}

  // Competitor Ads Methods
  setCompetitorAds(ads: CompetitorAd[]): void {
    this.competitorAds = ads;
    this.competitorAdsSubject.next([...this.competitorAds]);
  }

  getCompetitorAds(): CompetitorAd[] {
    return [...this.competitorAds];
  }

  getCompetitorAds$(): Observable<CompetitorAd[]> {
    return this.competitorAdsSubject.asObservable();
  }

  addCompetitorAd(ad: CompetitorAd): void {
    this.competitorAds.push(ad);
    this.competitorAdsSubject.next([...this.competitorAds]);
  }

  // Generated Ads Methods
  setGeneratedAds(ads: GeneratedAd[]): void {
    // Add timestamps and IDs if not present
    this.generatedAds = ads.map((ad, index) => ({
      ...ad,
      id: ad.id || `gen_ad_${Date.now()}_${index}`,
      timestamp: ad.timestamp || new Date().toISOString()
    }));
    this.generatedAdsSubject.next([...this.generatedAds]);
  }

  getGeneratedAds(): GeneratedAd[] {
    return [...this.generatedAds];
  }

  getGeneratedAds$(): Observable<GeneratedAd[]> {
    return this.generatedAdsSubject.asObservable();
  }

  addGeneratedAd(ad: GeneratedAd): void {
    const newAd: GeneratedAd = {
      ...ad,
      id: ad.id || `gen_ad_${Date.now()}_${this.generatedAds.length}`,
      timestamp: ad.timestamp || new Date().toISOString()
    };
    this.generatedAds.push(newAd);
    this.generatedAdsSubject.next([...this.generatedAds]);
  }

  updateGeneratedAd(index: number, ad: GeneratedAd): void {
    if (index >= 0 && index < this.generatedAds.length) {
      this.generatedAds[index] = {
        ...ad,
        id: this.generatedAds[index].id, // Keep original ID
        timestamp: new Date().toISOString() // Update timestamp
      };
      this.generatedAdsSubject.next([...this.generatedAds]);
    }
  }

  deleteGeneratedAd(index: number): void {
    if (index >= 0 && index < this.generatedAds.length) {
      this.generatedAds.splice(index, 1);
      this.generatedAdsSubject.next([...this.generatedAds]);
    }
  }

  // Editing Methods
  setAdsForEditing(ads: GeneratedAd[]): void {
    this.adsForEditing = [...ads];
    this.adsForEditingSubject.next([...this.adsForEditing]);
  }

  getAdsForEditing(): GeneratedAd[] {
    return [...this.adsForEditing];
  }

  getAdsForEditing$(): Observable<GeneratedAd[]> {
    return this.adsForEditingSubject.asObservable();
  }

  updateAdForEditing(index: number, ad: GeneratedAd): void {
    if (index >= 0 && index < this.adsForEditing.length) {
      this.adsForEditing[index] = { ...ad };
      this.adsForEditingSubject.next([...this.adsForEditing]);
    }
  }

  saveEditedAds(): void {
    // Replace the original generated ads with the edited ones
    this.adsForEditing.forEach((editedAd, index) => {
      const originalIndex = this.generatedAds.findIndex(ad => ad.id === editedAd.id);
      if (originalIndex !== -1) {
        this.updateGeneratedAd(originalIndex, editedAd);
      }
    });
    
    // Clear editing cache
    this.clearAdsForEditing();
  }

  clearAdsForEditing(): void {
    this.adsForEditing = [];
    this.adsForEditingSubject.next([]);
  }

  // Utility Methods
  clearAllData(): void {
    this.competitorAds = [];
    this.generatedAds = [];
    this.adsForEditing = [];
    this.competitorAdsSubject.next([]);
    this.generatedAdsSubject.next([]);
    this.adsForEditingSubject.next([]);
  }

  exportAdsAsJson(): string {
    return JSON.stringify({
      competitorAds: this.competitorAds,
      generatedAds: this.generatedAds,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }, null, 2);
  }

  importAdsFromJson(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.competitorAds && Array.isArray(data.competitorAds)) {
        this.setCompetitorAds(data.competitorAds);
      }
      
      if (data.generatedAds && Array.isArray(data.generatedAds)) {
        this.setGeneratedAds(data.generatedAds);
      }
      
      return true;
    } catch (error) {
      console.error('Error importing ads data:', error);
      return false;
    }
  }
  clearAll() {
    
    this.competitorAds = [];
    this.generatedAds = [];
  }

  getStats() {
    return {
      totalCompetitorAds: this.competitorAds.length,
      totalGeneratedAds: this.generatedAds.length,
      adsInEditing: this.adsForEditing.length,
      lastUpdate: new Date().toISOString()
    };
  }
   setAdImageId(id: string): void {
    this.adImageId = id;
  }


  getAdImageId(): string {
    return this.adImageId;
  }

 clearAdImageId(): void {
    this.adImageId = '';
  }
}