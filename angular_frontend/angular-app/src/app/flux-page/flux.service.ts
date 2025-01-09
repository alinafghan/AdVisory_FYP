import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FluxService {
  private apiUrl = 'http://localhost:5000/flux'; 

  constructor(private http: HttpClient) {}

  generateImage(defaultPrompt: string): Observable<any> {
    const requestBody = {};
    console.log('Sending request to Flux API:', requestBody);
    return this.http.post<any>(this.apiUrl, requestBody);
  }
}
