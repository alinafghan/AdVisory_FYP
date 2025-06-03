// flux-page.component.ts
import { Component, OnInit, ElementRef, ViewChild, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FluxService } from "./image-gen.service";
import { FormsModule } from "@angular/forms";
import { AdDataService } from "../../services/ad-data-service";
import { HttpHeaders } from "@angular/common/http";

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

   @Output() imageGenerated = new EventEmitter<{ adId: string }>();
  
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
         const token = localStorage.getItem('authToken');
            if (!token) {
              console.error('No auth token found');
              return;
            }
        
            const headers = new HttpHeaders({
              Authorization: `Bearer ${token}`,
            });
    this.fluxService.getAllCampaigns(headers).subscribe(data => {
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
    this.errorMessage = ''; // Clear any previous errors
    this.isLoading = true; // Show loading indicator
  
    // Check if the selected model requires image editing
    if (this.selectedModel === 'Edit Images') {
        // --- Existing Edit Image Logic (no change needed here based on the new error) ---
      if (!this.editImageFiles.length || !this.textPrompt) {
        this.errorMessage = 'Both image(s) and prompt are required for editing.';
        this.isLoading = false;
        return;
      }
  
      const enhancementParts: string[] = [];
      if (this.lighting) enhancementParts.push('${this.lighting} lighting');
      if (this.colors) enhancementParts.push('color scheme: ${this.colors}');
      if (this.style) enhancementParts.push('style: ${this.style}');
  
      const enhancementText = enhancementParts.length
      ? ` in ${enhancementParts.join(', ')}`
      : '';
      const fullPrompt = '${this.textPrompt.trim()}${enhancementText}';
  
      console.log('Sending request to Edit Image API with prompt:', fullPrompt);
  
      this.fluxService.editImage(fullPrompt, this.editImageFiles)
        .subscribe({
          next: (res) => {
          // Assuming res.imageBase64 is returned by the /edit-image endpoint
          if (res && res.imageBase64) { // Add check for response data
            this.generatedImage = `data:image/png;base64,${res.imageBase64}`;
          } else {
            this.errorMessage = 'Image editing response missing image data.';
            console.error('Edit image response:', res);
          }
            this.isLoading = false;
          },
            error: (err) => {
                    console.error('Image editing failed:', err);
                    this.errorMessage = err?.error?.error || 'Image editing failed. Check console for details.';
                    this.isLoading = false;
                }
            });
  
        return; // Exit after handling edit mode
    }
    // Handle Image Generation models (Flux and GPT Image)
    else if (this.selectedModel === 'Flux') {
         // Ensure prompt has some value
         if (!this.prompt) {
             this.prompt = this.constructedPrompt.trim();
         }
         if (!this.prompt) {
             this.errorMessage = 'A prompt is required for Flux image generation.';
             this.isLoading = false;
             return;
         }
  
        const requestData = {
            prompt: this.prompt,
            width: this.width,
            height: this.height,
            seed: this.randomizeSeed ? 0 : this.seed,
            num_inference_steps: this.num_inference_steps
        };
  
        // Call the generateImage service method (targets /flux)
        this.fluxService.generateImage(requestData)
            .subscribe({
                next: (res) => {
                    // --- FIX IS HERE for the Flux model ---
                    // Access the image data using the key 'Generated Image' from your Flask backend
                    if (res && res['Generated Image']) { // Add check for response data
                         this.generatedImage = `data:image/png;base64,${res['Generated Image']}`;
                    } else {
                         this.errorMessage = 'Flux image generation response missing image data.';
                         console.error('Flux response:', res); // Log the response to see its structure
                    }
  
                    this.isLoading = false;
                },
                error: (err) => {
                    console.error('Flux Image generation failed:', err);
                    this.errorMessage = err?.error?.error || 'Flux Image generation failed. Check console for details.';
                    this.isLoading = false;
                }
            });
    } else if (this.selectedModel === 'GPT Image') {
         // Ensure prompt has some value
         if (!this.prompt) {
              this.prompt = this.constructedPrompt.trim();
         }
          if (!this.prompt) {
             this.errorMessage = 'A prompt is required for GPT Image generation.';
             this.isLoading = false;
             return;
         }
  
        const requestData = {
            prompt: this.prompt
        };
  
        // Call the generateGptImage service method (targets /generate-ad-image)
        this.fluxService.generateGptImage(requestData)
            .subscribe({
                next: (res) => {
                     // --- This was already correct for the GPT Image endpoint ---
                     // Your /generate-ad-image backend returns 'imageBase64'
                    if (res && res.imageBase64) { // Add check for response data
                        this.generatedImage = `data:image/png;base64,${res.imageBase64}`;
                    } else {
                         this.errorMessage = 'GPT image generation response missing image data.';
                         console.error('GPT response:', res); // Log the response to see its structure
                    }
                    this.isLoading = false;
                },
                error: (err) => {
                    console.error('GPT Image generation failed:', err);
                    this.errorMessage = err?.error?.error || 'GPT Image generation failed. Check console for details.';
                    this.isLoading = false;
                }
            });
    }
    else {
        this.errorMessage = 'Please select a valid image generation model.';
        this.isLoading = false;
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
          this.imageGenerated.emit({ adId: adImageId });
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