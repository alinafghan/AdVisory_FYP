import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../layout/component/app.sidebar';
import { AppTopbar } from '../../layout/component/app.topbar';
import { CardWidget } from '../../layout/widgets/card-widget.component';
import { CustomButtonComponent } from '../../layout/widgets/button-icon.component'; // Corrected import path/name if needed

// Import RouterModule for routerLink directive
import { RouterModule } from '@angular/router';

// Removed unnecessary LucideAngularModule import, as specific icons are imported directly
// import { LucideAngularModule } from 'lucide-angular/src/icons'; // Not needed if importing individual icons

// Primeng modules (only if truly needed and imported inside app-custom-button or app-card-widget)
// If ButtonModule and TooltipModule are used internally by your CustomButtonComponent or CardWidget,
// then they should be imported there, not here. If you are using p-button directly in this template,
// then keep ButtonModule. Based on your HTML, you're using app-custom-button.
// import { ButtonModule } from 'primeng/button';
// import { TooltipModule } from 'primeng/tooltip';

import {
  ArrowRight,
  Plus,
  Image,
  DollarSign,
  Users,
  TrendingUp,
  BarChart2,
  PieChart,
  Calendar
} from 'lucide-angular';
import { trigger, transition, style, animate } from '@angular/animations';

// You'll need to install and import a chart library like Chart.js
// Example:
// import { NgChartsModule } from 'ng2-charts';
// import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    AppTopbar,
    CardWidget,
    CustomButtonComponent, // Crucial: Import your custom button component
    RouterModule, // Crucial: Import RouterModule for routerLink directive to work
    // NgChartsModule, // Uncomment if using chart library
    // If ButtonModule and TooltipModule are ONLY used by CardWidget or CustomButton, they should be imported there.
    // If you use them directly in home.component.html, then keep them here.
    // ButtonModule,
    // TooltipModule,
    // LucideAngularModule // Only if you use lucide components directly in this template
  ],
  styleUrls: ['./home.component.css'],
  templateUrl: './home.component.html',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class HomeComponent implements OnInit {
  // Icons (these are fine, assuming you're using them within a child component that uses Lucide)
  // If you plan to use these icons directly in home.component.html, you'd need to import LucideAngularModule
  // or specific Lucide components that use these icons.
  readonly ArrowRight = ArrowRight;
  readonly Plus = Plus;
  readonly Image = Image;
  readonly DollarSign = DollarSign;
  readonly Users = Users;
  readonly TrendingUp = TrendingUp;
  readonly BarChart2 = BarChart2;
  readonly PieChart = PieChart;
  readonly Calendar = Calendar;

  // User data
  userName: string = 'AdVisory Team';

  // Dashboard Data PropertiesAlex
  totalCampaigns: number = 0;
  activeCampaigns: number = 0;
  completedCampaigns: number = 0;
  totalAds: number = 0;
  totalSpend: number = 0;
  remainingBudget: number = 0;
  overallClicks: number = 0;
  overallClicksChange: string = '+0%';
  overallClicksIncreasing: boolean = true;

  // Recent Activities
  recentActivities: { date: string; description: string; type?: string }[] = [];

  // Loading states
  isDataLoading: boolean = true;
  isChartLoading: boolean = true;

  // Chart Data Properties (Example for Chart.js - uncomment and configure when integrating)
  /*
  public campaignPerformanceData: ChartData<'line'> = {
    labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
    datasets: [
      {
        label: 'Impressions',
        data: [],
        borderColor: '#a8d9e3',
        backgroundColor: 'rgba(168, 217, 227, 0.1)',
        tension: 0.4
      },
      {
        label: 'Clicks',
        data: [],
        borderColor: '#9579e3',
        backgroundColor: 'rgba(149, 121, 227, 0.1)',
        tension: 0.4
      }
    ]
  };

  public budgetAllocationData: ChartData<'pie'> = {
    labels: ['Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'Other'],
    datasets: [
      {
        data: [],
        backgroundColor: ['#a8d9e3', '#424cad', '#9579e3', '#ff0066', '#1d6b7b'],
      }
    ]
  };

  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#e9f5f8',
          font: {
            family: "'General Sans', sans-serif",
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#e9f5f8'
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#e9f5f8'
        }
      }
    }
  };
  */

  constructor() { }

  ngOnInit(): void {
    this.fetchDashboardData();
  }

  fetchDashboardData(): void {
    this.isDataLoading = true;
    
    // Simulate API fetch with timeout
    setTimeout(() => {
      // User data
      this.userName = 'AdVisory Team';
      
      // Campaign stats
      this.totalCampaigns = 12;
      this.activeCampaigns = 5;
      this.completedCampaigns = 7;
      this.totalAds = 85;
      this.totalSpend = 12500;
      this.remainingBudget = 7500;
      this.overallClicks = 25489;
      this.overallClicksChange = '+15% from last week';
      this.overallClicksIncreasing = true;

      // Recent activities with types for styling
      this.recentActivities = [
        { 
          date: '2025-05-20', 
          description: 'Campaign "Spring Collection" achieved 500 conversions.',
          type: 'success'
        },
        { 
          date: '2025-05-19', 
          description: 'New ad creative for "Summer Deals" campaign launched.',
          type: 'info'
        },
        { 
          date: '2025-05-18', 
          description: 'Budget for "Engagement Boost" campaign increased by $500.',
          type: 'warning'
        },
        { 
          date: '2025-05-17', 
          description: 'Product image "Shoes_Ad_Final" edited and approved.',
          type: 'info'
        },
        { 
          date: '2025-05-16', 
          description: 'Audience report for Q1 2025 generated.',
          type: 'info'
        },
      ];

      this.isDataLoading = false;
      this.loadChartData();
    }, 1000);
  }

  loadChartData(): void {
    this.isChartLoading = true;
    
    // Simulate loading chart data
    setTimeout(() => {
      // If you're using charts, populate the data here:
      /*
      // Line chart - Campaign Performance
      this.campaignPerformanceData.datasets[0].data = [
        1200, 1350, 1400, 1200, 1500, 1800, 2000, 1950, 2100, 2200, 
        2300, 2150, 2400, 2500, 2300, 2450, 2600, 2750, 2900, 3050, 
        3200, 3350, 3500, 3650, 3800, 3950, 4100, 4250, 4400, 4600
      ];
      
      this.campaignPerformanceData.datasets[1].data = [
        300, 320, 350, 340, 390, 400, 450, 480, 500, 520, 
        550, 570, 600, 650, 680, 700, 750, 800, 830, 850, 
        880, 910, 950, 980, 1000, 1050, 1100, 1150, 1200, 1250
      ];
      
      // Pie chart - Budget Allocation
      this.budgetAllocationData.datasets[0].data = [4500, 3000, 2000, 2000, 1000];
      */
      
      this.isChartLoading = false;
    }, 1500);
  }

  // Helper method to determine activity badge type
  getActivityBadgeClass(type: string): string {
    switch(type) {
      case 'success': return 'badge-primary';
      case 'warning': return 'badge-secondary';
      case 'info': return 'badge-accent';
      default: return 'badge-accent';
    }
  }
}