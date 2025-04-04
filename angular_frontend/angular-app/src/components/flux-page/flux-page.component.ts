import { Component } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { FluxService } from './flux.service';

@Component({
  selector: 'app-flux-page',
  templateUrl: './flux-page.component.html',
  styleUrls: ['./flux-page.component.css']
})
export class FluxPageComponent {
  adForm: FormGroup;
  generatedImage: string | null = null;
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private fluxService: FluxService) {
    // Initialize the form
    this.adForm = this.fb.group({
      category: ['', Validators.required],
      details: this.fb.group({
        productName: [''],
        targetAudience: [''],
        specialOffer: [''],
        eventName: [''],
        eventDate: [''],
        eventLocation: [''],
        uniqueSellingPoints: [''],
        salePeriod: [''],
        mainAttractions: [''],
        brandMessage: [''],
        keyVisuals: [''],
        prompt: ['']
      })
    });
  }

  generateAdImage(): void {
    if (this.adForm.invalid) {
      this.errorMessage = 'Please fill out the form correctly.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.generatedImage = null;

    // Get the entire form value
    const formValue = this.adForm.value.details;  // Accessing nested form group 'details'
    
    const prompt = `Generate an advertisement for ${this.adForm.value.category}: ` + 
                   `Sale Period: ${formValue.salePeriod}, ` +
                   `Main Attractions: ${formValue.mainAttractions}`;

    const requestData = {
      prompt: prompt,
      // additional data can be added here as needed
    };

    this.fluxService.generateImage(requestData).subscribe({
      next: (response: any) => {
        this.generatedImage = response.generatedImage;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.errorMessage = 'Failed to generate the image. Please try again later.';
        this.isLoading = false;
      }
    });
  }
}
