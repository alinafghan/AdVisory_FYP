import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CampaignComponent } from '../campaign/campaign.component';
import { FluxPageComponent } from '../image-gen/image-gen.component';
import {CaptionPageComponent} from '../caption-page/caption-page.component';
import { TrendsComponent } from '../trends-page/trends-page.component';
import { BudgetComponent } from '../budget/budget.component';
import { Router } from '@angular/router';


@Component({
  selector: 'app-pipeline',
  standalone: true,
  imports: [CommonModule, CampaignComponent, TrendsComponent, BudgetComponent, FluxPageComponent, CaptionPageComponent],
  templateUrl: './pipeline.component.html',
})
export class PipelineComponent {
  steps = ['Step 1', 'Step 2', 'Step 3', 'Step 4', 'Step 5'];
currentStep = 0;

nextStep() {
  if (this.currentStep < this.steps.length - 1) this.currentStep++;
}

prevStep() {
  if (this.currentStep > 0) this.currentStep--;
}
constructor(private router: Router) {}

finish() {
  this.router.navigate(['/home']);
}

}
