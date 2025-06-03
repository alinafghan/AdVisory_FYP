// audience-report.component.ts
import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AudienceService } from '../../services/audience-prediction.service';
import { CommonModule } from '@angular/common';
import { Observable, of, throwError, Subscription, Subject } from 'rxjs';
import { catchError, map, switchMap, takeUntil } from 'rxjs/operators';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { Pipe, PipeTransform } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AudienceReport } from '../../interfaces/audience-report';


@Pipe({
  name: 'replaceUnderscore',
  standalone: true
})
export class ReplaceUnderscorePipe implements PipeTransform {
  transform(value: string): string {
    return value ? value.replace(/_/g, ' ') : '';
  }
}

@Component({
  selector: 'app-audience-report',
  templateUrl: './audience-report.component.html', // Use templateUrl if HTML is in separate file
  styleUrls: ['./audience-report.component.css'],
  standalone: true,
  imports: [CommonModule, ReplaceUnderscorePipe, NgxChartsModule],
  providers: [AudienceService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AudienceReportComponent implements OnInit, OnDestroy, OnChanges {

  @Input() adId: string | null = null;

  audienceReport: AudienceReport | null = null;
  xaiReport: AudienceReport | null = null; // New property to store XAI specific report
  loading: boolean = false;
  loadingXAI: boolean = false; // New loading state for XAI
  error: string = '';
  xaiError: string = ''; // New error state for XAI
  showXAI: boolean = false;

  view: [number, number] = [700, 300];

  colorScheme = {
    domain: [
      '#a8cfd6', '#8171bc', '#363b72', '#295057',
      '#8d92c9', '#53438e', '#e0edf0', '#04090b',
    ]
  };

  private unsubscribe$ = new Subject<void>();

  constructor(
    private audienceService: AudienceService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['adId'] && changes['adId'].currentValue !== changes['adId'].previousValue) {
        console.log('Ad ID input changed, loading report:', this.adId);
        this.resetReportStates(); // Reset all states
        if (this.adId) {
           this.loadReport(); // Load main report
        } else {
           this.error = 'Ad ID not provided.';
        }
    }
  }

  ngOnInit(): void {
      console.log('AudienceReportComponent initialized');
      if (this.adId) {
        this.loadReport();
      }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private resetReportStates(): void {
    this.loading = false;
    this.loadingXAI = false;
    this.error = '';
    this.xaiError = '';
    this.audienceReport = null;
    this.xaiReport = null; // Clear XAI report too
    this.showXAI = false;
  }

  private loadReport(): void {
    if (!this.adId) {
      this.error = 'Ad ID is missing.';
      console.warn(this.error);
      return;
    }

    this.loading = true;
    this.error = '';

    this.audienceService.getAudienceReport(this.adId) // Call without xai=true
      .pipe(
        map(response => {
          if (!response || typeof response !== 'object' || !response['analysis']) {
            throw new Error('Invalid API response format or missing analysis data');
          }
          return response;
        }),
        catchError((err) => {
          this.error = `Failed to load audience report: ${err?.message || 'Unknown error'}`;
          console.error('Error fetching report:', err);
          this.loading = false;
          return of(null);
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(report => {
        this.loading = false;
        if (report) {
          this.audienceReport = report;
          console.log('Main API Response stored:', report);
        } else if (!this.error) {
           this.error = 'Received empty report data.';
           console.warn('Received null report data.');
        }
      });
  }

  loadXAIReport(): void {
    if (!this.adId) {
      this.xaiError = 'Ad ID is missing for XAI report.';
      return;
    }

    // Only load XAI report if it hasn't been loaded already
    if (this.xaiReport && this.xaiReport['analysis']?.xai?.heatmap) {
      this.showXAI = true; // Just show it if already loaded
      return;
    }

    this.loadingXAI = true;
    this.xaiError = '';

    this.audienceService.getAudienceReport(this.adId, true) // Call with xai=true
      .pipe(
        map(response => {
          if (!response || typeof response !== 'object' || !response['analysis'] || !response['analysis'].xai?.heatmap) {
            throw new Error('XAI report invalid or missing heatmap data');
          }
          return response;
        }),
        catchError((err) => {
          this.xaiError = `Failed to load XAI report: ${err?.message || 'Unknown error'}`;
          console.error('Error fetching XAI report:', err);
          this.loadingXAI = false;
          return of(null);
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(report => {
        this.loadingXAI = false;
        if (report) {
          this.xaiReport = report;
          this.showXAI = true; // Show XAI section upon successful load
          console.log('XAI API Response stored:', report);
        } else if (!this.xaiError) {
           this.xaiError = 'Received empty XAI report data.';
           console.warn('Received null XAI report data.');
        }
      });
  }

  toggleXAISection(): void {
    this.showXAI = !this.showXAI;
    if (this.showXAI) {
      this.loadXAIReport(); // Load XAI report only when showing the section
    }
  }

  getSortedKeys(obj: any): string[] {
      if (!obj || typeof obj !== 'object') {
          return [];
      }
      return Object.keys(obj).sort();
  }

  isObject(value: any): boolean {
      return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  getNgxChartData(categoryData: any): { name: string, value: number }[] {
    if (!this.isObject(categoryData)) {
      return [];
    }

    const chartData = Object.keys(categoryData).map(key => {
      let value = categoryData[key];
      if (typeof value !== 'number') {
          value = parseFloat(value);
          if (isNaN(value)) value = 0;
      }

      return {
        name: this.transformKeyForChart(key),
        value: value
      };
    });

    return chartData.sort((a, b) => b.value - a.value);
  }

  transformKeyForChart(key: string): string {
      return key ? key.replace(/_/g, ' ') : '';
  }

  yAxisTickFormatting(value: number): string {
      return `${(value * 100).toFixed(0)}%`;
  }
}