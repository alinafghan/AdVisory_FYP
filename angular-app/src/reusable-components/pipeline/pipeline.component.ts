import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CampaignComponent } from '../campaign/campaign.component';
import { FluxPageComponent } from '../../reusable-components/image-gen/image-gen.component';
import {CaptionPageComponent} from '../../reusable-components/caption-page/caption-page.component';
import { BudgetComponent } from '../budget/budget.component';
import { Router } from '@angular/router';
import { CompetitorAdsComponent } from '../../components/competitor-ads/competitor-ads.component';
import { AudienceReportComponent } from '../audience-report/audience-report.component';
import { ChooseComponent } from '../image-gen/choose.component';
import { ProductAdComponent } from '../productad-page/productad.component';
import { ProductAdCustomComponent } from '../productad-page/productadcustom.component';

@Component({
  selector: 'app-pipeline',
  standalone: true,
  imports: [ FormsModule, CommonModule, CampaignComponent, ChooseComponent, FluxPageComponent, ProductAdComponent, 
    ProductAdCustomComponent,CaptionPageComponent, BudgetComponent, CompetitorAdsComponent, AudienceReportComponent],
  templateUrl: './pipeline.component.html',
})
export class PipelineComponent {
  steps = ['Step 1', 'Step 2', 'Step 3', 'Step 4', 'Step 5', 'Step 6', 'Step 7'];
  currentStep = 0;
  selectedOption: string | null = null; // track what user selected
  
  // Add the missing adId property
  adId: string = ''; // Initialize with empty string or get from somewhere

  constructor(private router: Router) {}
  
  // flag for if user selects product ad, then they can continue to productadcustom page
  isProductAdCustomPage = false;

  //if user chooses not to generate an ad, they can skip to caption page
  nextStep() {
    if (this.currentStep === 2 && !this.selectedOption) {
      this.currentStep = 3;
    } else {
      this.currentStep++;
    }
    if (this.currentStep !== 2) {
      this.isProductAdCustomPage = false;
    }
  }
  
  prevStep() {
    if (this.currentStep === 3 && !this.selectedOption) {
      this.currentStep = 1; // Skip back directly to Choose if no option selected
    } else {
      this.currentStep--;
    }
    if (this.currentStep !== 2) {
      this.isProductAdCustomPage = false; // Reset
    }
  }

  handleOptionSelection(option: string) {
    this.selectedOption = option;
    console.log('User selected:', option);
    this.nextStep(); // after selecting, move to FluxPage or ProductAdPage
  }

  finish() {
    this.router.navigate(['/home']);
  }
  
  //navigating to productadcustom if productad is selected  
  handleContinue() {
    this.isProductAdCustomPage = true;
  }
  
  onCampaignCreated() {
    this.nextStep(); // Move to the next step in the pipeline (competitor-ads)
  }
}