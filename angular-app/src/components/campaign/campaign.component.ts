import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-campaign',
  templateUrl: './campaign.component.html',
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent],
})
export class CampaignComponent {
  campaignForm: FormGroup;
  apiUrl = 'http://localhost:3000/ads/postCampaign';

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.campaignForm = this.fb.group({
      name: ['', Validators.required],
      industry: ['', Validators.required],
      platform: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    });
  }

  generateRandomId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  createCampaign(): void {
    if (this.campaignForm.invalid) {
      alert('Please fill all fields!');
      return;
    }

    const { name, industry, platform, startDate, endDate } = this.campaignForm.value;
    const duration = `${startDate} to ${endDate}`;

    const newCampaign = {
      campaignId: this.generateRandomId(),
      businessId: this.generateRandomId(),
      campaignName: name,
      industry,
      platform,
      duration
    };

    this.http.post(this.apiUrl, newCampaign).subscribe(
      (response) => {
        console.log('Campaign created:', response);
        alert('Campaign created successfully!');
        this.router.navigate(['/']); 
      },
      (error) => {
        console.error(newCampaign);
        console.error('Error creating campaign:', error);
        alert('Failed to create campaign.');
      }
    );
  }
}
