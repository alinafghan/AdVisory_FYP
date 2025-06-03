// src/app/services/audience-prediction.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AudienceReport } from '../interfaces/audience-report';

@Injectable({
  providedIn: 'root',
})
export class AudienceService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/analyze-audience';

  // Modified method to accept a flag for XAI
  getAudienceReport(adId: string, includeXai: boolean = false): Observable<AudienceReport> {
    let params = new HttpParams();

    if (includeXai) {
      params = params.append('xai', 'true');
    }

    const url = `${this.apiUrl}/${adId}`;
    return this.http.get<AudienceReport>(url, { params });
  }
}
