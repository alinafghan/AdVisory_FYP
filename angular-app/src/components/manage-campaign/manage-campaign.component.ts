import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { LucideAngularModule, Route } from 'lucide-angular';
import { ArrowRight } from 'lucide-angular/src/icons';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-manage-campaign',
  standalone: true,
  imports: [SidebarComponent, LucideAngularModule, CommonModule, RouterModule],
  templateUrl: './manage-campaign.component.html',
})
export class ManageCampaignComponent implements OnInit {
  readonly ArrowRight = ArrowRight;

   campaigns: any[] = []; // Stores campaign IDs

      constructor(private http: HttpClient) {
      }

       ngOnInit() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No auth token found');
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.fetchCampaigns(headers);
  }

  fetchCampaigns(headers: HttpHeaders) {
    this.http
      .get<any[]>('http://localhost:3000/ads/getAllCampaigns', { headers })
      .subscribe(
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
