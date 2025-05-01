import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FluxService {
  private apiUrl = 'http://localhost:5000/flux';
  private gptApiUrl = 'http://localhost:5000/generate-ad-image';
  private enhanceUrl = 'http://localhost:5000/enhance';

  constructor(private http: HttpClient) {}

  getAllCampaigns(): Observable<any> {
    return this.http.get('http://localhost:3000/ads/getAllCampaigns');
  }

  addImageToCampaign(data: any): Observable<any> {
    return this.http.post('http://localhost:3000/adImages/add', data);
  }

  generateImage(requestData: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    console.log('Sending request to Flux API:', requestData);
    return this.http.post<any>(this.apiUrl, requestData, { headers });
  }

  generateGptImage(requestData: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    console.log('Sending request to GPT Image API:', requestData);
    return this.http.post<any>(this.gptApiUrl, requestData, { headers });
  }

  enhancePrompt(requestData: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    console.log('Sending request to EnhanceFlux API:', requestData);
    return this.http.post(this.enhanceUrl, requestData, { headers });
  }
}