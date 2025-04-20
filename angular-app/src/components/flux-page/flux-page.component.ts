// flux-page.component.ts
import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FluxService } from "./flux.service";
import { FormsModule } from "@angular/forms";
import { AdDataService } from "../../services/ad-data.service";
// import { HeaderComponent } from "../header.component";

@Component({
  selector: "app-flux-page",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./flux-page.component.html",
  styleUrls: ["./flux-page.component.css"],
})
export class FluxPageComponent implements OnInit {
  // Ad Type Selection
  selectedAdType: string | null = null;
  
  // Product Ad Fields
  productType: string = '';
  productName: string = '';
  productAppearance: string = '';
  
  // Sale Ad Fields
  saleType: string = '';
  discountAmount: string = '';
  limitedTimeOffer: string = '';
  
  // Event Ad Fields
  eventName: string = '';
  eventDate: string = '';
  eventLocation: string = '';
  
  // Common Fields
  details: string = '';
  lighting: string = '';
  colors: string = '';
  style: string = '';

  // Image Generation Parameters
  prompt: string = "";
  width: number = 1080;
  height: number = 1920;
  seed: number = 0;
  randomizeSeed: boolean = true;
  num_inference_steps: number = 4;

  campaigns: any[] = [];
  selectedCampaign!: string;

  // UI State
  isLoading: boolean = false;
  isEnhancingPrompt: boolean = false;
  errorMessage: string | null = null;
  generatedImage: string | null = null;
  showAdvancedParams: boolean = false;
  showDimensionsDropdown: boolean = false;

  // Dimensions Presets
  dimensions: string[] = [
    "Vertical (1080 × 1920)",
    "YouTube Thumbnail (1280 × 720)",
    "3:4 Post (1080 × 1440)",
    "Custom",
  ];
  selectedDimension: string = "Vertical (1080 × 1920)";

  // Enhanced Prompt
  enhancedPrompt: string = "";
  isPromptEnhanced: boolean = false;

  constructor(private fluxService: FluxService, private adDataService: AdDataService) {}  //ad data service is for the pipeline, to pass ad data to caption step
  ngOnInit() {
    this.fluxService.getAllCampaigns().subscribe(data => {
      this.campaigns = data;
    });
  }
  
  // Select ad type and reset other types' fields
  selectAdType(type: string): void {
    if (this.selectedAdType === type) {
      // If clicking the same button, deselect it
      this.selectedAdType = null;
    } else {
      this.selectedAdType = type;
    }
  }
  
  // Construct the prompt dynamically based on filled fields
  get constructedPrompt(): string {
    let promptParts: string[] = ["a social media advertisement for"];
    
    // Add ad type specific content
    if (this.selectedAdType === 'Product') {
      if (this.productType) promptParts.push(this.productType);
      if (this.productName) promptParts.push(this.productName);
      if (this.productAppearance) promptParts.push(`with ${this.productAppearance}`);
    } else if (this.selectedAdType === 'Sale') {
      if (this.saleType) promptParts.push(this.saleType);
      if (this.discountAmount) promptParts.push(`featuring ${this.discountAmount}`);
      if (this.limitedTimeOffer) promptParts.push(this.limitedTimeOffer);
    } else if (this.selectedAdType === 'Event') {
      if (this.eventName) promptParts.push(this.eventName);
      if (this.eventDate) promptParts.push(`on ${this.eventDate}`);
      if (this.eventLocation) promptParts.push(`at ${this.eventLocation}`);
    }
    
    // Add common fields
    if (this.details) promptParts.push(this.details);
    if (this.lighting) promptParts.push(`with ${this.lighting} lighting`);
    if (this.colors) promptParts.push(`in ${this.colors} colors`);
    if (this.style) promptParts.push(`in ${this.style} style`);
    
    return promptParts.join(' ');
  }

  toggleAdvancedParams(): void {
    this.showAdvancedParams = !this.showAdvancedParams;
  }

  toggleDimensionsDropdown(): void {
    this.showDimensionsDropdown = !this.showDimensionsDropdown;
  }

  selectDimension(dimension: string): void {
    this.selectedDimension = dimension;
    this.showDimensionsDropdown = false;

    // Update width and height based on selection
    switch (dimension) {
      case "Vertical (1080 × 1920)":
        this.width = 1080;
        this.height = 1920;
        break;
      case "YouTube Thumbnail (1280 × 720)":
        this.width = 1280;
        this.height = 720;
        break;
      case "3:4 Post (1080 × 1440)":
        this.width = 1080;
        this.height = 1440;
        break;
      // Custom dimension keeps current values
    }
  }

  generateAdImage(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.generatedImage = null;

    // Use the enhanced prompt if available, otherwise use the constructed prompt
    const promptToUse = this.isPromptEnhanced ? this.enhancedPrompt : this.constructedPrompt;
    
    const requestData = {
      prompt: promptToUse,
      seed: this.seed,
      randomize_seed: this.randomizeSeed,
      width: this.width,
      height: this.height,
      num_inference_steps: this.num_inference_steps,
    };

    console.log("Request payload:", requestData);

    this.fluxService.generateImage(requestData).subscribe({
      next: (response: any) => {
        if (response["Generated Image"]) {
          const base64ImageData = response["Generated Image"];
          this.generatedImage = `data:image/webp;base64,${base64ImageData}`;
          console.log("Generated Image URL:", this.generatedImage);
        } else {
          this.errorMessage = "Unexpected response from server.";
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error("Error generating image:", error);
        this.errorMessage =
          "Failed to generate the image. Please try again later.";
        this.isLoading = false;
      },
    });
  }
  

  submitImageToCampaign(imageData: string) {
    if (!imageData) {
      console.error('No image data to submit');
      return;
    }
    if (!this.selectedCampaign) {
      alert('Please select a campaign first.');
      return;
    }
    
    // Use the enhanced prompt if available, otherwise use the constructed prompt
    const promptToUse = this.isPromptEnhanced ? this.enhancedPrompt : this.constructedPrompt;
    
    const postData = {
      campaignId: this.selectedCampaign,
      prompt: promptToUse,
      width: this.width,
      height: this.height,
      imageData: imageData
    };

    this.fluxService.addImageToCampaign(postData).subscribe({
      next: (response: any) => {
        console.log('Upload successful', response);
  
        const adImageId = response?.adImage?.id;
  
        if (adImageId) {
          this.adDataService.setAdImageId(adImageId);
          console.log('Stored adImageId in service:', adImageId);
        } else {
          console.warn('No adImageId received in response.');
        }
      },
      error: (err) => {
        console.error('Error uploading image:', err);
      }
    });
  }

  fetchAds() {
    // Implementation of fetching ads based on the selected campaign
    console.log("Fetching ads for campaign:", this.selectedCampaign);
  }

  // enhancePrompt(): void {
  //   this.isLoading = true;
  //   this.errorMessage = null;

  //   const requestData = {
  //     prompt: this.constructedPrompt
  //   };

  //   console.log("Enhancing prompt:", requestData);

  //   this.fluxService.enhancePrompt(requestData).subscribe({
  //     next: (response: any) => {
  //       if (response["enhanced_prompt"]) {
  //         this.enhancedPrompt = response["enhanced_prompt"];
  //         this.isPromptEnhanced = true;
  //         console.log("Enhanced prompt:", this.enhancedPrompt);
  //       } else {
  //         this.errorMessage = "Unexpected response from server.";
  //       }
  //       this.isLoading = false;
  //     },
  //     error: (error) => {
  //       console.error("Error enhancing prompt:", error);
  //       this.errorMessage =
  //         "Failed to enhance prompt. Please try again later.";
  //       this.isLoading = false;
  //     },
  //   });
  // }


  enhancePrompt(): void {
    this.isEnhancingPrompt = true; // Use the new flag instead of isLoading
    this.errorMessage = ''; // Clear any previous error messages
    
    const requestData = {
      prompt: this.constructedPrompt
    };
    
    console.log("Enhancing prompt:", requestData);
    
    this.fluxService.enhancePrompt(requestData).subscribe({
      next: (response: any) => {
        if (response["enhanced_prompt"]) {
          this.enhancedPrompt = response["enhanced_prompt"];
          this.isPromptEnhanced = true;
          console.log("Enhanced prompt:", this.enhancedPrompt);
        } else {
          this.errorMessage = "Unexpected response from server.";
        }
        this.isEnhancingPrompt = false; // Reset our new flag when complete
      },
      error: (error) => {
        console.error("Error enhancing prompt:", error);
        this.errorMessage = "Failed to enhance prompt. Please try again later.";
        this.isEnhancingPrompt = false; // Reset our new flag on error too
      },
    });
  }
  
  // Clear enhanced prompt and use constructed prompt again
  resetPrompt(): void {
    this.enhancedPrompt = "";
    this.isPromptEnhanced = false;
  }
}
