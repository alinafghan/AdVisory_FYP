// audience-report.component.ts
import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AudienceService } from '../../services/audience-prediction.service';
import { CommonModule } from '@angular/common';
import { Observable, of, throwError, Subscription, Subject } from 'rxjs';
import { catchError, map, switchMap, takeUntil } from 'rxjs/operators';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AudienceReport } from '../../interfaces/audience-report';
import { Pipe, PipeTransform } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';


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
  // Changed selector name to reflect its reusable purpose
  selector: 'app-audience-report',
  template: `
    <div *ngIf="loading" class="text-center p-6 text-text">
      <p>Loading audience report...</p>
    </div>

    <div *ngIf="error && !loading" class="text-red-500 bg-red-100 border border-red-400 rounded p-4 mb-6">
      <p>Error: {{ error }}</p>
    </div>

    <div *ngIf="!loading && !error && audienceReport?.['analysis'] as analysis" class="report-container p-6 bg-background text-text shadow-md">

      <h2 class="text-3xl font-bold text-center text-primary mb-8">Audience Analysis Report</h2>

      <div *ngIf="analysis.summary as summary" class="report-section mb-8 p-6 bg-background border border-primary rounded-md shadow-sm">
        <h3 class="text-xl font-semibold text-primary border-b-2 border-primary/50 pb-2 mb-4">Summary</h3>
        <div class="summary-item mb-3 leading-relaxed flex items-start">
          <strong class="mr-2 text-primary inline-block min-w-[150px]">Primary Persona:</strong>
          <span class="text-text">{{ summary.primary_persona || 'N/A' }}</span>
        </div>
        <div class="summary-item mb-3 leading-relaxed flex items-start">
          <strong class="mr-2 text-primary inline-block min-w-[150px]">Visual Style Suggestion:</strong>
          <span class="text-text">{{ summary.visual_style || 'N/A' }}</span>
        </div>
        <div class="summary-item mb-3 leading-relaxed flex items-start">
          <strong class="mr-2 text-primary inline-block min-w-[150px]">Domain:</strong>
          <span class="text-text">{{ summary.domain || 'N/A' }}</span>
        </div>
        <div class="summary-item mb-3 leading-relaxed flex items-start">
          <strong class="mr-2 text-primary inline-block min-w-[150px]">Detected Caption Intent:</strong>
          <span class="text-text">{{ summary.caption || 'N/A' }}</span>
        </div>
        <div class="summary-item mb-3 leading-relaxed flex items-start">
          <strong class="mr-2 text-primary inline-block min-w-[150px]">Identified Trends:</strong>
          <span *ngIf="summary.trends?.length > 0; else noTrends" class="text-text">
            {{ summary.trends.join(', ') }}
          </span>
          <ng-template #noTrends><span class="text-text">N/A</span></ng-template>
        </div>
        <div class="summary-item mb-0 leading-relaxed flex items-start">
          <strong class="mr-2 text-primary inline-block min-w-[150px]">Identified Themes:</strong>
          <span *ngIf="summary.themes?.length > 0; else noThemes" class="text-text">
            {{ summary.themes.join(', ') }}
          </span>
          <ng-template #noThemes><span class="text-text">N/A</span></ng-template>
        </div>
      </div>

      <div *ngIf="analysis['demographics'] as demographics" class="report-section mb-8 p-6 bg-background border border-primary rounded-md shadow-sm">
        <h3 class="text-xl font-semibold text-primary border-b-2 border-primary/50 pb-2 mb-4">Detailed Demographics</h3>

        <div *ngFor="let category of getSortedKeys(demographics)" class="demographic-category mb-6">

          <h4 class="text-lg font-medium text-accent mt-6 mb-3">{{ category | titlecase | replaceUnderscore }}</h4>

          <ng-container *ngIf="isObject(demographics[category]); else singleValue">
            <div class="chart-container p-4 bg-background border border-primary/30 rounded-md shadow-inner">
              <ngx-charts-bar-vertical
                [view]="[700, 300]"
                [results]="getNgxChartData(demographics[category])"
                [xAxis]="true"
                [yAxis]="true"
                [legend]="true"
                [showXAxisLabel]="true"
                [showYAxisLabel]="true"
                [xAxisLabel]="'Demographic Group'"
                [yAxisLabel]="'Percentage'"
                [colorScheme]="colorScheme">
              </ngx-charts-bar-vertical>
            </div>
          </ng-container>

          <ng-template #singleValue>
              <p class="mb-3 py-2 text-text/70 italic">{{ demographics[category] }}</p>
          </ng-template>

        </div>
          <p *ngIf="getSortedKeys(demographics).length === 0" class="text-text/70 italic">No demographic categories found.</p>
      </div>

      <p *ngIf="!analysis.summary && !analysis['demographics']" class="text-text/70 italic text-center">Analysis data is incomplete.</p>

      </div>
    `,
  styleUrls: ['./audience-report.component.css'],
  standalone: true,
  // Only import dependencies needed for the report display itself
  imports: [CommonModule, ReplaceUnderscorePipe, NgxChartsModule],
  // Keep AudienceService provided here, or provide it higher up if preferred
  providers: [AudienceService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AudienceReportComponent implements OnInit, OnDestroy, OnChanges {

  @Input() adId: string | null = null; // Input property

  audienceReport: AudienceReport | null | { [key: string]: any } = null;
  loading: boolean = false;
  error: string = '';

  view: [number, number] = [700, 300]; // Consider making this an @Input() too

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

  // React to input property changes
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['adId'] && changes['adId'].currentValue !== changes['adId'].previousValue) {
        console.log('Ad ID input changed, loading report:', this.adId);
        // Trigger loadReport only if the adId is valid
        if (this.adId) {
           this.loadReport();
        } else {
           this.error = 'Ad ID not provided.';
           this.audienceReport = null;
           this.loading = false;
        }
    }
  }

  ngOnInit(): void {
      console.log('AudienceReportComponent initialized');
      // Load the report if adId is already provided on init
      if (this.adId) {
        this.loadReport();
      }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private loadReport(): void {
    if (!this.adId) {
      this.error = 'Ad ID is missing.';
      this.audienceReport = null;
      this.loading = false;
      console.warn(this.error);
      return;
    }

    this.loading = true;
    this.error = '';
    this.audienceReport = null;

    this.audienceService.getAudienceReport(this.adId)
      .pipe(
        map(response => {
          if (!response || typeof response !== 'object') {
            throw new Error('Invalid API response format');
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
        if (report && report['analysis']) {
          this.audienceReport = report;
          console.log('API Response stored:', report);
        } else if (report === null && !this.error) {
           this.error = 'Received empty report data.';
           console.warn('Received null report data.');
        } else if (report && !report['analysis']){
             this.error = 'API response received but missing "analysis" data.';
             console.warn('API response missing analysis:', report);
        }
      });
  }

  // Keep these helper methods
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