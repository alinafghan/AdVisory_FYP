import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',  // Could also be added in 'caption.module.ts' under providers
})

export class CaptionService {
  private apiUrl = 'http://localhost:3000/generate-caption'; 

  constructor(private http: HttpClient) {}

  getPrediction(params: any): Observable<any> {
    const queryParams = new URLSearchParams(params).toString();
    const url = `${this.apiUrl}?${queryParams}`;
    console.log("this is the url", url)
    return this.http.get<any>(url);
  }
}
