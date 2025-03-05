import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import { BudgetService } from './budget.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-budget-page',
  imports: [FormsModule, CommonModule],
  templateUrl: './budget-page.component.html',
  styleUrl: './budget-page.component.css'
})
export class BudgetPageComponent {
  targetAudienceOptions = [
    { label: 'All Ages', value: 0 },
    { label: 'Men 18-24', value: 1 },
    { label: 'Men 25-34', value: 2 },
    { label: 'Men 35-44', value: 3 },
    { label: 'Men 45-60', value: 4 },
    { label: 'Women 18-24', value: 5 },
    { label: 'Women 25-34', value: 6 },
    { label: 'Women 35-44', value: 7 },
    { label: 'Women 45-60', value: 8 },
];
    campaignGoalOptions = [
      {label: 'Brand Awareness', value: '0'},
      {label: 'Increase Sales', value: '1'},
      {label: 'Market Expansion', value: '2'},
      {label: 'Product Launch', value: '3'}
    ];
    durationOptions = [
      
      {label: '15 Days', value: 0},
      {label: '30 Days', value: 1},{ label:'45 Days', value: 2},{ label:'60 Days', value: 3}
    ];

    channelOptions = [
      
      {label: 'Facebook', value: 0},
      {label: 'Instagram', value: 1},{ label:'Pinterest', value: 2},{ label:'Twitter', value: 3}
    ];

    locationOptions = [
      
      {label: 'Austin', value: 0},
      {label: 'Las Vegas', value: 1},
      { label:'Los Angeles', value: 2},
      { label:'Miami', value: 3},
      { label:'New York', value: 4}
    ];

    languageOptions = [
      
      {label: 'English', value: 0},
      {label: 'French', value: 1},{ label:'Spanish', value: 2}
    ];

    customerSegmentOptions = [
      {label: 'Fashion', value: 0},
      {label: 'Food', value: 1},
      { label:'Health', value: 2},
      { label:'Home', value: 3},
      { label:'Technology', value: 4}
    ]


  target_audience = '';
  campaign_goal = '';
  duration = '';
  channel_used = '';
  conv_rate = '';
  acq_cost = '';
  location = '';
  language = '';
  clicks = '';
  impressions = '';
  engagement_score = '';
  cust_segment = '';
  cpc = '';
  ctr = '';
  cpi = '';
  engagement_rate = '';

  predictionResult: string = '';

  // Inject the BudgetService into the component
  constructor(private budgetService: BudgetService) {}

  // Method to handle the form submission and call the API
  submitForm() {
    const params = {
      Target_Audience: this.target_audience,
      Campaign_Goal: this.campaign_goal,
      Duration: this.duration,
      Channel_Used: this.channel_used,
      Conversion_Rate: this.conv_rate,
      Acquisition_Cost: this.acq_cost,
      Location: this.location,
      Language: this.language,
      Clicks: this.clicks,
      Impressions: this.impressions,
      Engagement_Score: this.engagement_score,
      Customer_Segment: this.cust_segment,
      // Scaled_ROI: 0.6,
      // Year: 2025,
      // Month: 1,
      // Day: 13,
      // ROI_log: 0.6,
      Cost_Per_Click: this.cpc,
      Click_Through_Rate: this.ctr,
      Cost_Per_Impression: this.cpc,
      Engagement_Rate: this.engagement_rate,
                               
      // 5.0,        # ROI (float64)

      // 900.0,       # Conversions (float64)

      // 0.2,        # Cost_Per_Engagement (float64)
    };

    console.log("params being sent", params)

    // Call the getPrediction method from the service
    this.budgetService.getPrediction(params).subscribe(
      (response) => {
        console.log(response)
        // Display the prediction result in the component
        if (response) {
          this.predictionResult = `Prediction: ${response}`;
        } else {
          this.predictionResult = 'No prediction available';
        }
      },
      (error) => {
        // Handle any errors that occur during the request
        console.error('Error fetching prediction:', error);
        this.predictionResult = 'Error in fetching prediction';
      }
    );
  }
}
