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
  param1 = '';
  param2 = '';
  param3 = '';
  param4 = '';
  param5 = '';
  param6 = '';
  param7 = '';
  param8 = '';
  param9 = '';
  param10 = '';
  param11 = '';
  param12 = '';
  param13 = '';
  param14 = '';
  param15 = '';
  param16 = '';
  param17 = '';
  param18 = '';
  param19 = '';
  param20 = '';
  param21 = '';

  predictionResult: string = '';

  // Inject the BudgetService into the component
  constructor(private budgetService: BudgetService) {}

  // Method to handle the form submission and call the API
  submitForm() {
    const params = {
      Target_Audience: this.param1,
      Campaign_Goal: this.param2,
      Duration: this.param3,
      Channel_Used: this.param4,
      Conversion_Rate: this.param5,
      Acquisition_Cost: this.param6,
      Location: this.param7,
      Language: this.param8,
      Clicks: this.param9,
      Impressions: this.param10,
      Engagement_Score: this.param11,
      Customer_Segment: this.param12,
      Scaled_ROI: this.param13,
      Year: this.param14,
      Month: this.param15,
      Day: this.param16,
      ROI_log: this.param17,
      Cost_Per_Click: this.param18,
      Click_Through_Rate: this.param19,
      Cost_Per_Impression: this.param20,
      Engagement_Rate: this.param21,
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
