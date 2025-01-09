import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FluxService } from './flux.service'; // Ensure the path is correct

@Component({
  selector: 'app-flux-page',
  standalone: true,
  imports: [CommonModule], // Import CommonModule to use *ngIf
  templateUrl: './flux-page.component.html',
  styleUrls: ['./flux-page.component.css']
})
export class FluxPageComponent {
  generatedImage: string | null = null; // URL of the generated image
  isLoading: boolean = false; // Loading state
  errorMessage: string | null = null; // Error message for failed requests

  constructor(private fluxService: FluxService) {}

  generateAdImage(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.generatedImage = null;

    console.log('Sending API request to generate image...');

    this.fluxService.generateImage('default-prompt').subscribe({
      next: (response: any) => {
        if (response['Generated Image'] && response['Generated Image'][0]) {
          this.generatedImage = response['Generated Image'][0];
          console.log('Generated Image URL:', this.generatedImage);
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
