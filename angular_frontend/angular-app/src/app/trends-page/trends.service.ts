import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Define the interfaces directly in the service file
interface TrendInsight {
  peak_day: string;
  trend_direction: string;
  growth_rate: number;
  volatility: number;
  current_value: number;
  predicted_value: number;
  predicted_popularity: number; // Added
  estimated_search_volume: number; // Added
}

interface Recommendation {
  keyword: string;
  timing: string;
  content_suggestion: string;
  budget_allocation: string;
  trend_metrics: {
    current_value: number;
    predicted_value: number;
    growth_rate: number;
    predicted_popularity: number; // Added
    estimated_search_volume: number; // Added
  };
}

interface TrendAnalysisResponse {
  insights: { [key: string]: TrendInsight };
  recommendations: Recommendation[];
}

@Injectable({
  providedIn: 'root',
})
export class TrendsService {
  private apiUrl = 'http://localhost:3000/trends';

  constructor(private http: HttpClient) {}

  getTrendAnalysis(keywords: string[]): Observable<TrendAnalysisResponse> {
    return this.http.post<TrendAnalysisResponse>(`${this.apiUrl}/analyze`, { keywords }).pipe(
      catchError((error) => {
        console.error('Error fetching trend analysis:', error);
        return throwError(() => new Error('Failed to analyze trends.'));
      })
    );
  }

  getPredictions(keyword: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/predictions/${keyword}`).pipe(
      catchError((error) => {
        console.error(`Error fetching predictions for keyword "${keyword}":`, error);
        return throwError(() => new Error('Failed to fetch predictions.'));
      })
    );
  }

  searchTrends(query: string): Observable<TrendAnalysisResponse> {
    return this.http.post<TrendAnalysisResponse>(`${this.apiUrl}/search`, { query }).pipe(
      catchError((error) => {
        console.error('Error searching trends:', error);
        return throwError(() => new Error('Failed to search trends.'));
      })
    );
  }
}