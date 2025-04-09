import { Component, OnInit } from '@angular/core';
import {FormsModule} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-budget-page',
  imports: [FormsModule, CommonModule],
  templateUrl: './budget-page.component.html',
})
  export class BudgetPageComponent implements OnInit {
    campaigns: any[] = []; // Stores campaign IDs
    selectedCampaign: any = ''; // Selected campaign
    ads: any[] = []; // Stores ads from selected campaign
    totalBudget: number = 0; // User inputted budet
    allocatedBudgets: any[] = []; // Stores allocated budget response
  
    constructor(private http: HttpClient) {}
  
    ngOnInit() {
      this.fetchCampaigns();
    }
  
    fetchCampaigns() {
      this.http.get<string[]>('http://localhost:3000/ads/getAllCampaigns').subscribe(
        (response) => {
          this.campaigns = response;
        },
        (error) => {
          console.error('Error fetching campaigns:', error);
        }
      );
    }
  
    fetchAds() {
      console.log('Selected campaign:', this.selectedCampaign);
      if (!this.selectedCampaign) return;
  
      this.http.post<any[]>('http://localhost:3000/ads/getAdsfromCampaign', { campaignId: this.selectedCampaign }).subscribe(
        (response) => {
          this.ads = response;
          this.allocatedBudgets = []; // Reset allocated budgets when new ads are loaded
        },
        (error) => {
          console.error('Error fetching ads:', error);
        }
      );
    }
  
    allocateBudget() {
      if (!this.totalBudget || this.totalBudget <= 0) return;
  
      this.http.post<any[]>('http://localhost:3000/ads/getBudget', {
        campaignId: this.selectedCampaign,
        totalBudget: this.totalBudget
      }).subscribe(
        (response) => {
          this.allocatedBudgets = response;
        },
        (error) => {
          console.error('Error allocating budget:', error);
        }
      );
    }
  }