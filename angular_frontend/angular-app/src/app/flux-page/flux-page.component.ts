import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FluxService } from './flux.service'; 
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-flux-page',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './flux-page.component.html',
  styleUrls: ['./flux-page.component.css']
})
export class FluxPageComponent {
  generatedImage: string | null = null; // URL of the generated image
  isLoading: boolean = false; // Loading state
  errorMessage: string | null = null; // Error message for failed requests

  prompt: string = "an ad for facebook "; // Default values
  seed: number = 0;
  randomizeSeed: boolean = true;
  width: number = 576;
  height: number = 1024;
  num_inference_steps: number = 4;

  constructor(private fluxService: FluxService) {}

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
      num_inference_steps: this.num_inference_steps
    };
    // const requestData = {
    //   prompt: 'a dog', // Test with the same payload as in Postman
    //   seed: 0,
    //   randomize_seed: true,
    //   width: 1024,
    //   height: 1024,
    //   num_inference_steps: 4,
    // };
  
    console.log('Request payload:', requestData);

    console.log('Sending API request to generate image...');

    this.fluxService.generateImage(requestData).subscribe({
      next: (response: any) => {
        if (response['Generated Image']) {
          const base64ImageData = response['Generated Image'];
          const decodedImage = `data:image/webp;base64,${base64ImageData}`;
          this.generatedImage = decodedImage;
          console.log('Generated Image URL:', this.generatedImage);
          console.log('Decoded Image URL:', decodedImage);

          // this.generatedImage = `http://localhost:5000${response['Generated Image']}`;
          // console.log('Generated Image URL:', this.generatedImage);
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
