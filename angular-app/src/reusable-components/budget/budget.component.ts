import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan-ng/ui-select-helm';
import { HlmFormFieldModule } from '@spartan-ng/ui-formfield-helm';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';

@Component({
  selector: 'app-budget',
  imports: [FormsModule, CommonModule, BrnSelectImports, HlmSelectImports,HlmInputDirective,HlmButtonDirective, HlmFormFieldModule],
  templateUrl: './budget.component.html',
})
export class BudgetComponent implements OnInit {
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
        console.log('Ads:', this.ads);
        this.allocatedBudgets = []; // Reset allocated budgets when new ads are loaded
      },
      (error) => {
        console.error('Error fetching ads:', error);
      }
    );
  }

  allocateBudget() {
    if (!this.totalBudget || this.totalBudget <= 0) return;
    console.log(this.selectedCampaign, this.totalBudget);

    this.http.post<any[]>('http://localhost:3000/budget/get', {
      campaignId: this.selectedCampaign,
      totalBudget: this.totalBudget
    }).subscribe(
      (response) => {
        this.allocatedBudgets = response;
        console.log('Allocated budgets:', this.allocatedBudgets);
      },
      (error) => {
        console.error('Error allocating budget:', error);
      }
    );
  }
}