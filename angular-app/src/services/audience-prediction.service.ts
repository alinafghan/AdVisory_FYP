import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AudienceReport } from '../interfaces/audience-report'; 

@Injectable({
  providedIn: 'root',
})
export class AudienceService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/analyze-audience'; 

  getAudienceReport(adId: string): Observable<AudienceReport> {
    const url = `${this.apiUrl}/${adId}`;
    return this.http.get<AudienceReport>(url);
  }
}
