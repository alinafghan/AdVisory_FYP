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
  private editImageUrl = 'http://localhost:5000/edit-image';

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

  editImage(prompt: string, imageFiles: File[]): Observable<any> {
    const formData = new FormData();
    formData.append('prompt', prompt);
    imageFiles.forEach((file, i) => {
      formData.append('image', file); // appending multiple under same key
    });
  
    return this.http.post<any>('http://127.0.0.1:5000/edit-image', formData);
  }
  
  
}