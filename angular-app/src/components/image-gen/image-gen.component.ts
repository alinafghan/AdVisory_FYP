// flux-page.component.ts
import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FluxService } from "./image-gen.service";
import { FormsModule } from "@angular/forms";
import { AdDataService } from "../../services/ad-data.service";

@Component({
  selector: "app-flux-page",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./image-gen.component.html",
  styleUrls: ["./image-gen.component.css"],
})
export class FluxPageComponent implements OnInit {
  modelOptions: string[] = ["Flux", "GPT Image"];
  selectedModel: string = "Flux";

  selectedAdType: string | null = null;

  productType: string = '';
  productName: string = '';
  productAppearance: string = '';

  saleType: string = '';
  discountAmount: string = '';
  limitedTimeOffer: string = '';

  eventName: string = '';
  eventDate: string = '';
  eventLocation: string = '';

  details: string = '';
  lighting: string = '';
  colors: string = '';
  style: string = '';

  prompt: string = "";
  width: number = 1080;
  height: number = 1920;
  seed: number = 0;
  randomizeSeed: boolean = true;
  num_inference_steps: number = 4;

  campaigns: any[] = [];
  selectedCampaign!: string;

  isLoading: boolean = false;
  isEnhancingPrompt: boolean = false;
  errorMessage: string | null = null;
  generatedImage: string | null = null;
  showAdvancedParams: boolean = false;
  showDimensionsDropdown: boolean = false;

  dimensions: string[] = [
    // "Vertical (1080 × 1920)",
    // "YouTube Thumbnail (1280 × 720)",
    // "3:4 Post (1080 × 1440)",
    // "Custom",

    "Square 1024x1024", 
    "Landscape 1536x1024", 
    "Portrait 1024x1536" 
  ];
  selectedDimension: string = "Square 1024x1024";

  enhancedPrompt: string = "";
  isPromptEnhanced: boolean = false;

  constructor(private fluxService: FluxService, private adDataService: AdDataService) {}

  ngOnInit() {
    this.fluxService.getAllCampaigns().subscribe(data => {
      this.campaigns = data;
    });
  }

  selectAdType(type: string): void {
    this.selectedAdType = this.selectedAdType === type ? null : type;
  }

  get constructedPrompt(): string {
    let promptParts: string[] = ["A social media ad for"];

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

    // 1024x1024, 1536x1024 (landscape), 1024x1536 (portrait)
    switch (dimension) {
      // case "Vertical (1080 × 1920)":
      //   this.width = 1080;
      //   this.height = 1920;
      //   break;
      
      // case "YouTube Thumbnail (1280 × 720)":
      //   this.width = 1280;
      //   this.height = 720;
      //   break;
      // case "3:4 Post (1080 × 1440)":
      //   this.width = 1080;
      //   this.height = 1440;
      //   break;
      case "Landscape Post (1536 × 1024)":
          this.width = 1080;
          this.height = 1440;
          break;
      case "1x1 Post (1024 x 1024)":
          this.width = 1024;
          this.height = 1024;
          break;
      case "Portrait Post (1536 × 1024)":
            this.width = 1024;
            this.height = 1536;
            break;
    }
  }

  generateAdImage(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.generatedImage = null;

    const promptToUse = this.isPromptEnhanced ? this.enhancedPrompt : this.constructedPrompt;
    const requestData: any = { prompt: promptToUse };

    if (this.selectedModel === 'Flux') {
      console.log('[Model] Using FLUX model for generation');
      requestData.seed = this.seed;
      requestData.randomize_seed = this.randomizeSeed;
      requestData.width = this.width;
      requestData.height = this.height;
      requestData.num_inference_steps = this.num_inference_steps;

      this.fluxService.generateImage(requestData).subscribe({
        next: (response: any) => {
          if (response["Generated Image"]) {
            const base64ImageData = response["Generated Image"];
            this.generatedImage = `data:image/webp;base64,${base64ImageData}`;
            console.log("[Response] Flux image generated successfully");
          } else {
            this.errorMessage = "Unexpected response from server.";
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error("[Error] Flux image generation failed:", error);
          this.errorMessage = "Failed to generate the image. Please try again later.";
          this.isLoading = false;
        },
      });
    } else if (this.selectedModel === 'GPT Image') {
      console.log('[Model] Using GPT Image model for generation');

      this.fluxService.generateGptImage(requestData).subscribe({
        next: (response: any) => {
          if (response.imageBase64) {
            this.generatedImage = `data:image/png;base64,${response.imageBase64}`;
            console.log("[Response] GPT image generated successfully");
          } else {
            this.errorMessage = "Unexpected response from server.";
          }
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error("[Error] GPT image generation failed:", error);
          this.errorMessage = "Failed to generate the image. Please try again later.";
          this.isLoading = false;
        },
      });
    } else {
      console.warn('[Model] No model selected');
      this.errorMessage = "No model selected.";
      this.isLoading = false;
    }
  }

  submitImageToCampaign(imageData: string) {
    if (!imageData) {
      console.error('[Submit] No image data to submit');
      return;
    }
    if (!this.selectedCampaign) {
      alert('Please select a campaign first.');
      return;
    }

    const promptToUse = this.isPromptEnhanced ? this.enhancedPrompt : this.constructedPrompt;

    const postData = {
      campaignId: this.selectedCampaign,
      prompt: promptToUse,
      width: this.width,
      height: this.height,
      imageData: imageData,
      model: this.selectedModel
    };

    this.fluxService.addImageToCampaign(postData).subscribe({
      next: (response: any) => {
        console.log('[Submit] Upload successful', response);
        const adImageId = response?.adImage?.id;
        if (adImageId) {
          this.adDataService.setAdImageId(adImageId);
          console.log('[Submit] Stored adImageId in service:', adImageId);
        } else {
          console.warn('[Submit] No adImageId in response.');
        }
      },
      error: (err) => {
        console.error('[Submit] Error uploading image:', err);
      }
    });
  }

  fetchAds() {
    console.log("[Campaign] Fetching ads for:", this.selectedCampaign);
  }

  enhancePrompt(): void {
    this.isEnhancingPrompt = true;
    this.errorMessage = '';

    const requestData = {
      prompt: this.constructedPrompt
    };

    console.log("[Enhance] Enhancing prompt:", requestData);

    this.fluxService.enhancePrompt(requestData).subscribe({
      next: (response: any) => {
        if (response["enhanced_prompt"]) {
          this.enhancedPrompt = response["enhanced_prompt"];
          this.isPromptEnhanced = true;
          console.log("[Enhance] Prompt enhanced:", this.enhancedPrompt);
        } else {
          this.errorMessage = "Unexpected response from server.";
        }
        this.isEnhancingPrompt = false;
      },
      error: (error) => {
        console.error("[Enhance] Error enhancing prompt:", error);
        this.errorMessage = "Failed to enhance prompt. Please try again later.";
        this.isEnhancingPrompt = false;
      },
    });
  }

  resetPrompt(): void {
    this.enhancedPrompt = "";
    this.isPromptEnhanced = false;
  }
}