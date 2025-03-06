import { Component } from '@angular/core';
import { FormGroup, Validators, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { FluxService } from './flux.service';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { FormsModule } from '@angular/forms'; // Import FormsModule

@Component({
  selector: 'app-flux-page',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule], // Add CommonModule and FormsModule
  templateUrl: './flux-page.component.html',
  styleUrls: ['./flux-page.component.css']
})
export class FluxPageComponent {
  adForm: FormGroup;
  generatedImage: string | null = null;
  isLoading: boolean = false;
  errorMessage: string | null = null;

  // Add the missing properties
  prompt: string = '';
  seed: number = 0;
  randomizeSeed: boolean = true;
  width: number = 1024;
  height: number = 1024;
  num_inference_steps: number = 4;

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
        prompt: [''],
      })
    });

    // Update form fields based on selected category
    const categoryControl = this.adForm.get('category');
    if (categoryControl) {
      categoryControl.valueChanges.subscribe(value => this.updateFormFields(value));
    } else {
      console.error('Category control is not found in the form group.');
    }
  }

  updateFormFields(category: string): void {
    const details = this.adForm.get('details') as FormGroup;
    if (!details) return; // Guard clause if details are somehow null

    Object.keys(details.controls).forEach(key => {
      details.get(key)?.setValue('');
      details.get(key)?.clearValidators();
      details.get(key)?.updateValueAndValidity();
    });

    if (category === 'Product Launches') {
      details.get('productName')?.setValidators([Validators.required]);
      details.get('targetAudience')?.setValidators([Validators.required]);
      details.get('specialOffer')?.setValidators([Validators.required]);
    } else if (category === 'Event Promotions') {
      details.get('eventName')?.setValidators([Validators.required]);
      details.get('eventDate')?.setValidators([Validators.required]);
      details.get('eventLocation')?.setValidators([Validators.required]);
      details.get('uniqueSellingPoints')?.setValidators([Validators.required]);
    } else if (category === 'Seasonal Sales') {
      details.get('salePeriod')?.setValidators([Validators.required]);
      details.get('mainAttractions')?.setValidators([Validators.required]);
    } else if (category === 'Brand Awareness') {
      details.get('brandMessage')?.setValidators([Validators.required]);
      details.get('keyVisuals')?.setValidators([Validators.required]);
    }

    details.updateValueAndValidity();
  }

  generateAdImage(): void {
    console.log('generateAdImage() called'); // Debugging
  
    if (this.adForm.invalid) {
      this.errorMessage = 'Please fill out the form correctly.';
      return;
    }
  
    this.isLoading = true;
    this.errorMessage = null;
    this.generatedImage = null;
  
    // Get the selected category
    const category = this.adForm.get('category')?.value;
    console.log('Selected Category:', category); // Debugging
  
    // Get the details form group
    const details = this.adForm.get('details') as FormGroup;
    console.log('Details Form Group:', details.value); // Debugging
  
    // Construct the prompt dynamically based on the category
    let prompt = '';
    if (category === 'Product Launches') {
      prompt = `Generate an advertisement for a new product launch. 
                Product Name: ${details.get('productName')?.value}, 
                Target Audience: ${details.get('targetAudience')?.value}, 
                Special Offer: ${details.get('specialOffer')?.value}`;
    } else if (category === 'Event Promotions') {
      prompt = `Generate an advertisement for an event. 
                Event Name: ${details.get('eventName')?.value}, 
                Event Date: ${details.get('eventDate')?.value}, 
                Event Location: ${details.get('eventLocation')?.value}, 
                Unique Selling Points: ${details.get('uniqueSellingPoints')?.value}`;
    } else if (category === 'Seasonal Sales') {
      prompt = `Generate an advertisement for a seasonal sale. 
                Sale Period: ${details.get('salePeriod')?.value}, 
                Main Attractions: ${details.get('mainAttractions')?.value}`;
    } else if (category === 'Brand Awareness') {
      prompt = `Generate an advertisement for brand awareness. 
                Brand Message: ${details.get('brandMessage')?.value}, 
                Key Visuals: ${details.get('keyVisuals')?.value}`;
    }
  
    // Append the additional details (custom prompt) to the main prompt
    const additionalDetails = details.get('prompt')?.value;
    console.log('Additional Details:', additionalDetails); // Debugging
    if (additionalDetails) {
      prompt += `\nAdditional Details: ${additionalDetails}`;
    }
  
    console.log('Constructed Prompt:', prompt); // Debugging
  
    // Add additional parameters to the request data
    const requestData = {
      prompt: prompt, // Use the dynamically constructed prompt
      seed: this.seed,
      randomize_seed: this.randomizeSeed,
      width: this.width,
      height: this.height,
      num_inference_steps: this.num_inference_steps,
    };
  
    // Send the request to the backend service
    this.fluxService.generateImage(requestData).subscribe({
      next: (response: any) => {
        if (response['Generated Image']) {
          const base64ImageData = response['Generated Image'];
          this.generatedImage = `data:image/webp;base64,${base64ImageData}`;
        } else {
          this.errorMessage = 'Unexpected response from server.';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error generating image:', error);
        this.errorMessage = 'Failed to generate the image. Please try again later.';
        this.isLoading = false;
      }
    });
  }





}