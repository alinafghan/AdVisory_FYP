import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AudienceService } from '../../services/audience-prediction.service';
import { CommonModule } from '@angular/common';
import { Observable, of, throwError, Subscription } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { NgxChartsModule } from '@swimlane/ngx-charts'; // Import NgxChartsModule
import { AudienceReport } from '../../interfaces/audience-report';
import { Pipe, PipeTransform } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { LoggedInNavbarComponent } from '../../components/loggedin-navbar/loggedin-navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';

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
  selector: 'app-target-audience',
  templateUrl: './target-audience.component.html',
  styleUrls: ['./target-audience.component.css'],
  standalone: true,
  imports: [CommonModule, ReplaceUnderscorePipe, NgxChartsModule, 
    LoggedInNavbarComponent, FooterComponent],
  providers: [AudienceService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Add this line
})

export class TargetAudienceComponent implements OnInit, OnDestroy {
  adId: string | null = null;
  audienceReport: AudienceReport | null | { [key: string]: any } = null;
  loading: boolean = false;
  error: string = '';
  private subscription: Subscription | undefined;

  view: [number, number] = [700, 300];

  // Updated colorScheme format for newer ngx-charts versions
  colorScheme = {
    domain: [
      '#a8cfd6', // primary
      '#8171bc', // accent
      '#363b72', // secondary
      '#295057', // primary light
      '#8d92c9', // secondary light
      '#53438e', // accent light
      '#e0edf0', // text (dark mode)
      '#04090b', // background (dark mode)
    ]
  };

  constructor(
    private route: ActivatedRoute,
    private audienceService: AudienceService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
       console.log('ngOnInit called');
        this.loading = true;
        this.subscription = this.route.paramMap
            .pipe(
                map((params) => params.get('id')),
                switchMap((id) => {
                    this.adId = id;
                    console.log('Ad ID received:', this.adId);
                    if (!id) {
                        this.error = 'Ad ID not found in URL.';
                        this.loading = false;
                        return throwError(() => new Error(this.error));
                    }
                    return this.audienceService.getAudienceReport(id).pipe(
                        map(response => {
                            if (!response || typeof response !== 'object') {
                                throw new Error('Invalid API response format');
                            }
                            return response;
                        })
                    );
                }),
                catchError((err) => {
                    this.error = `Failed to load audience report: ${err?.message || 'Unknown error'}`;
                    console.error('Error caught in ngOnInit:', err);
                    this.loading = false;
                    return of(null);
                })
            )
            .subscribe((report) => {
                this.loading = false;
                if (report) {
                    if (report['analysis']) {
                        this.audienceReport = report;
                        console.log('API Response stored:', report);
                    } else {
                        this.error = 'API response received but missing "analysis" data.';
                        console.warn('API response missing analysis:', report);
                        this.audienceReport = null;
                    }
                } else if (!this.error) {
                   this.error = 'Received empty report data.';
                   console.warn('Received null report data.');
                }
            });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
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