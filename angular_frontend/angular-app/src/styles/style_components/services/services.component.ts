// src/app/components/services/services.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ServiceCardComponent } from '../service_card/service_card.component';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  standalone: true,  
  imports: [CommonModule, ServiceCardComponent]  
})
export class ServicesComponent {
  services = [
    {
      title: 'AdGen',
      subtitle: 'AI-Powered Ad Creation',
      description: 'Instantly generate high-performing ad creatives tailored to your brand and audience.',
      link: '/flux',
      routerLinkActive: false,
      iconPath: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" /></svg>'
    },
    {
      title: 'SmartBudget',
      subtitle: 'Optimized Ad Spend Planning',
      description: 'Plan and allocate your ad budget efficiently to maximize ROI with data-driven insights.',
      link: '/budget',
      routerLinkActive: false,
      iconPath: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>'
    },
    {
      title: 'TrendTrack',
      subtitle: 'Real-Time Market Trends',
      description: 'Stay ahead of the competition with insights into trending topics, audience behaviors, and ad performance.',
      link: '/metrics',
      routerLinkActive: false,
      iconPath: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>'
    },
    {
      title: 'TargetAudience',
      subtitle: 'AI-Powered Target Audience Prediction',
      description: 'Identify the ideal audience for your ads and maximize performance with AI-driven insights.',
      link: '/audience',
      routerLinkActive: true,
      iconPath: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>'
    }
  ];
}