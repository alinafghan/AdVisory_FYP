import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AdDataService {
  private competitorAds: any[] = [];
  private generatedAds: any[] = [];
  private adImageId: string = '';

  setCompetitorAds(data: any[]) {
    this.competitorAds = data;
  }

  getCompetitorAds() {
    return this.competitorAds;
  }

  setGeneratedAds(data: any[]) {
    this.generatedAds = data;
  }

  getGeneratedAds() {
    return this.generatedAds;
  }

  clearAll() {
    this.competitorAds = [];
    this.generatedAds = [];
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



