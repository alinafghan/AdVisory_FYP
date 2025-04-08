// flux-page.component.ts
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FluxService } from "./flux.service";
import { FormsModule } from "@angular/forms";
// import { HeaderComponent } from "../header.component";

@Component({
  selector: "app-flux-page",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./flux-page.component.html",
  styleUrls: ["./flux-page.component.css"],
})
export class FluxPageComponent {
  // Image Generation Parameters
  prompt: string = "An advertisement for ";
  width: number = 1024;
  height: number = 1024;
  seed: number = 0;
  randomizeSeed: boolean = true;
  num_inference_steps: number = 4;

  // UI State
  isLoading: boolean = false;
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

  constructor(private fluxService: FluxService) {}

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

    const requestData = {
      prompt: this.prompt,
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
}