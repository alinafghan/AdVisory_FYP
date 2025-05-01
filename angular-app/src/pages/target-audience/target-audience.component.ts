import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AudienceService } from '../../services/audience-prediction.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-target-audience',
  templateUrl: './target-audience.component.html',
  styleUrls: ['./target-audience.component.css'],
  imports: [CommonModule],
})
export class TargetAudienceComponent implements OnInit {
  adId: string | null = null;
  audienceReport: any;
  loading: boolean = false;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private audienceService: AudienceService
  ) {
    console.log('TargetAudienceComponent constructed');
  }

  ngOnInit(): void {
    console.log('ngOnInit called');
    this.route.paramMap.subscribe(params => {
      this.adId = params.get('id');
      console.log('Ad ID received in ngOnInit:', this.adId);
      if (this.adId) {
        this.loadAudienceReport(this.adId);
      } else {
        this.error = 'Ad ID not found in URL.';
        this.loading = false;
      }
    });
  }

  loadAudienceReport(adId: string): void {
    this.loading = true;
    this.error = '';
    console.log('loadAudienceReport called with ID:', adId);
    this.audienceService.getAudienceReport(adId).subscribe({
      next: (report) => {
        console.log('API Response received:', report);
        this.audienceReport = report;
        this.loading = false;
        console.log('Audience Report set:', this.audienceReport);
  
        // Log the stringified JSON of the entire report
        console.log('Raw Audience Report (JSON String):', JSON.stringify(this.audienceReport, null, 2));
  
        // (Keep your existing key logging for now)
        if (this.audienceReport?.summary) {
          console.log('Summary Keys:', Object.keys(this.audienceReport.summary));
        }
        if (this.audienceReport?.detailed_demographics) {
          console.log('Detailed Demographics Keys:', Object.keys(this.audienceReport.detailed_demographics));
        }
        if (this.audienceReport?.content_analysis) {
          console.log('Content Analysis Keys:', Object.keys(this.audienceReport.content_analysis));
        }
      },
      error: (err) => {
        this.error = 'Error fetching audience report: ' + err;
        this.loading = false;
        console.error('Error fetching audience report:', err);
      }
    });
  }

  getSortedKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  getTopEntries(obj: any): [string, number][] {
    return (Object.entries(obj) as [string, number][])
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2);
  }
}