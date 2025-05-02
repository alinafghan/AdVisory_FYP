// flux-page.component.ts
import { Component, OnInit, ElementRef, ViewChild } from "@angular/core";
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
  @ViewChild('imageUpload') imageUpload!: ElementRef;
  @ViewChild('maskUpload') maskUpload!: ElementRef;

  modelOptions: string[] = ["Flux", "GPT Image", "Edit Image"];
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

  // Edit mode properties
  sourceImage: File | null = null;
  sourceImagePreview: string | null = null;
  maskImage: File | null = null;
  maskImagePreview: string | null = null;
  editQuality: string = 'auto';
  editModel: string = 'gpt-image-1';
  n: number = 1;

  campaigns: any[] = [];
  selectedCampaign!: string;

  isLoading: boolean = false;
  isEnhancingPrompt: boolean = false;
  errorMessage: string | null = null;
  generatedImage: string | null = null;
  showAdvancedParams: boolean = false;
  showDimensionsDropdown: boolean = false;

  dimensions: string[] = [
    "Square 1024x1024", 
    "Landscape 1536x1024", 
    "Portrait 1024x1536" 
  ];
  selectedDimension: string = "Square 1024x1024";

  enhancedPrompt: string = "";
  isPromptEnhanced: boolean = false;
  textPrompt!: string;

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
    let promptParts: string[] = ["A social media ad"];

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
      case "Landscape 1536x1024":
          this.width = 1536;
          this.height = 1024;
          break;
      case "Square 1024x1024":
          this.width = 1024;
          this.height = 1024;
          break;
      case "Portrait 1024x1536":
          this.width = 1024;
          this.height = 1536;
          break;
    }
  }

  sourceImageFile: File | null = null;
maskImageFile: File | null = null;

onMaskImageSelected(event: any) {
  const file = event.target.files[0];
  if (file) {
    this.maskImageFile = file;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.maskImagePreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

editImageFiles: File[] = [];

  generateAdImage() {
    this.errorMessage = '';
  this.isLoading = true;

  if (this.selectedModel === 'Edit Images') {
    if (!this.editImageFiles.length || !this.textPrompt) {
      this.errorMessage = 'Both image(s) and prompt are required.';
      this.isLoading = false;
      return;
    }

    // Construct enhancement context
    const enhancementParts: string[] = [];
    if (this.lighting) enhancementParts.push(`${this.lighting} lighting`);
    if (this.colors) enhancementParts.push(`color scheme: ${this.colors}`);
    if (this.style) enhancementParts.push(`style: ${this.style}`);

    // Build full prompt
    const enhancementText = enhancementParts.length
      ? ` in ${enhancementParts.join(', ')}`
      : '';
    const fullPrompt = `${this.textPrompt.trim()}${enhancementText}`;

    this.prompt = fullPrompt;

    this.fluxService.editImage(fullPrompt, this.editImageFiles)
      .subscribe({
        next: (res) => {
          this.generatedImage = `data:image/png;base64,${res.imageBase64}`;
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage = err?.error?.error || 'Image editing failed';
          this.isLoading = false;
        }
      });

    return;
    }
    else {
      // GENERATE IMAGE
      this.fluxService.generateImage(prompt)
        .subscribe({
          next: (res) => {
            this.generatedImage = `data:image/png;base64,${res.imageBase64}`;
            this.isLoading = false;
          },
          error: (err) => {
            this.errorMessage = err?.error?.error || 'Image generation failed';
            this.isLoading = false;
          }
        });
    }
  }
  
removeSourceImage() {
  this.sourceImagePreview = null;
  this.sourceImageFile = null;
}

browseSourceImage() {
  const input = document.querySelector<HTMLInputElement>('#imageUpload');
  input?.click();
}

browseMaskImage() {
  const input = document.querySelector<HTMLInputElement>('#maskUpload');
  input?.click();
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

  // Image upload handling methods
  onSourceImageSelected(event: any) {
    const files = event.target.files;
    if (files.length) {
      this.editImageFiles = Array.from(files);
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.sourceImagePreview = e.target.result;
      };
      reader.readAsDataURL(files[0]); // preview only 1st image
    }
  }
  

  removeMaskImage(): void {
    this.maskImage = null;
    this.maskImagePreview = null;
    if (this.maskUpload) {
      this.maskUpload.nativeElement.value = '';
    }
  }

  onModelChange(): void {
    // Reset errors when changing models
    this.errorMessage = null;
    
    // Reset generated image if switching between generate/edit modes
    this.generatedImage = null;
  }
}