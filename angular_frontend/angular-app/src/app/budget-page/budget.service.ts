import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',  // Optional: Could also be added in 'budget.module.ts' under providers
})

export class BudgetService {
  private apiUrl = 'http://localhost:3000/predict'; // Your API endpoint

  constructor(private http: HttpClient) {}

  // Method to send a request and get prediction
  getPrediction(params: any): Observable<any> {
    const queryParams = new URLSearchParams(params).toString();
    const url = `${this.apiUrl}?${queryParams}`;
    console.log("this is the url", url)
    return this.http.get<any>(url);
  }
}
