import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { LucideAngularModule, Route } from 'lucide-angular';
import { ArrowRight } from 'lucide-angular/src/icons';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-manage-campaign',
  standalone: true,
  imports: [SidebarComponent, LucideAngularModule, CommonModule, RouterModule],
  templateUrl: './manage-campaign.component.html',
})
export class ManageCampaignComponent implements OnInit {
  readonly ArrowRight = ArrowRight;

   campaigns: any[] = []; // Stores campaign IDs

      constructor(private http: HttpClient) {}
    
      ngOnInit() {
        this.fetchCampaigns();
      }
    
      fetchCampaigns() {
        this.http.get<string[]>('http://localhost:3000/ads/getAllCampaigns').subscribe(
          (response) => {
            this.campaigns = response;
            console.log('Fetched campaigns:', response);
          },
          (error) => {
            console.error('Error fetching campaigns:', error);
          }
        );
      }

}
