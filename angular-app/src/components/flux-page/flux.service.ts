import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FluxService {
  private apiUrl = 'http://localhost:5000/flux';

  constructor(private http: HttpClient) {}

  generateImage(requestData: any): Observable<any> {
    const headers = new HttpHeaders({
        'Content-Type': 'application/json' // Ensure the request sends JSON data
      });
    console.log('Sending request to Flux API:', requestData);
    return this.http.post<any>(this.apiUrl, requestData, { headers });  }
}