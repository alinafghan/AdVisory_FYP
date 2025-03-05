import { Component, OnInit } from '@angular/core';
import { TrendsService } from './trends.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

@Component({
  selector: 'app-trends',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './trends-page.component.html',
  styleUrls: ['./trends-page.component.css']
})
export class TrendsComponent implements OnInit {
  keywords: string[] = [];
  trendInsights: { [key: string]: TrendInsight } | null = null;
  recommendations: Recommendation[] = [];
  isLoading: boolean = false;
  error: string | null = null;

  // Add the searchQuery property
  searchQuery: string = '';

  constructor(private trendsService: TrendsService) {}

  ngOnInit() {
    this.keywords = ['Environment', 'Sports', 'Music'];
    this.analyzeTrends();
  }

  analyzeTrends() {
    this.isLoading = true;
    this.error = null;

    this.trendsService.getTrendAnalysis(this.keywords).subscribe({
      next: (response: TrendAnalysisResponse) => {
        this.trendInsights = response.insights;
        this.recommendations = response.recommendations;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Error analyzing trends. Please try again.';
        this.isLoading = false;
        console.error('Error:', error);
      }
    });
  }

  searchTrends(query: string): void {
    this.isLoading = true;
    this.error = null;
  
    this.trendsService.searchTrends(query).subscribe({
      next: (response: TrendAnalysisResponse) => {
        this.trendInsights = response.insights;
        this.recommendations = response.recommendations;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Error searching trends. Please try again.';
        this.isLoading = false;
        console.error('Error:', error);
      }
    });
  }

  // Add the onSearch method
  onSearch() {
    console.log('Search query:', this.searchQuery);
    if (this.searchQuery.trim()) {
      // Filter insights and recommendations based on the search query
      const filteredInsights = Object.fromEntries(
        Object.entries(this.trendInsights || {}).filter(([key]) =>
          key.toLowerCase().includes(this.searchQuery.toLowerCase())
        )
      );
      this.trendInsights = filteredInsights;

      this.recommendations = this.recommendations.filter(rec =>
        rec.keyword.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      // If the search query is empty, reset the data
      this.analyzeTrends();
    }
  }
}