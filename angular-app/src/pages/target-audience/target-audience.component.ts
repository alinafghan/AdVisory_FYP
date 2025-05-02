import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { AudienceReportComponent } from '../../reusable-components/audience-report/audience-report.component';

import { LoggedInNavbarComponent } from '../../components/loggedin-navbar/loggedin-navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';


@Component({
  selector: 'app-target-audience',
  template: `
    <app-loggedin-navbar></app-loggedin-navbar>

    <div class="page-content p-4"> <app-audience-report [adId]="adId"></app-audience-report>

      </div>

    <app-footer></app-footer>
  `,
  styleUrls: ['./target-audience.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    LoggedInNavbarComponent,
    FooterComponent,
    AudienceReportComponent 
  ],
})
export class TargetAudienceComponent implements OnInit, OnDestroy {

  adId: string | null = null;
  private routeSubscription: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router 
  ) {}

  ngOnInit(): void {
      console.log('TargetAudience (Page) component initialized');
      this.routeSubscription = this.route.paramMap
          .pipe(
              map(params => params.get('id'))
          )
          .subscribe(id => {
              this.adId = id; 
              console.log('Ad ID from route:', this.adId);
          });
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }
}