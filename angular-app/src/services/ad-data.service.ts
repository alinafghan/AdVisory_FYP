import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AdDataService {

  constructor() { }
  private adImageId: string = '';

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
