import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdDataService } from '../../services/ad-data-service';

@Component({
  selector: 'app-caption-page',
  templateUrl: './caption-page.component.html',
  styleUrls: ['./caption-page.component.css'],
  imports: [CommonModule, FormsModule],
  standalone: true
})
export class CaptionPageComponent implements OnInit {
  textPrompt: string = '';
  caption?: string;
  ad?: any;
  isLoading: boolean = false;
  captionSource: 'text' | 'image' = 'text';
  error?: string;

  constructor(
    private http: HttpClient, 
    private route: ActivatedRoute, 
    private adDataService: AdDataService
  ) {}

  ngOnInit(): void {
    const imageId = this.route.snapshot.queryParamMap.get('ad');
    if (imageId) {
      this.fetchAdImage(imageId);
    } else {
      const adImageId = this.adDataService.getAdImageId();
      if (adImageId) {
        this.fetchAdImage(adImageId);
      } else {
        this.error = 'No ad image ID found in the URL or service.';
        console.error(this.error);
      }
    }
  }

  fetchAdImage(imageId: string) {
    this.http.get<any>(`http://localhost:3000/adImages/${imageId}`)
      .subscribe({
        next: (response) => {
          this.ad = response;
          // If an ad is loaded, default to using the image if available
          if (this.ad?.imageData) {
            this.captionSource = 'image';
          }
        },
        error: (error) => {
          this.error = 'Error fetching ad image.';
          console.error(this.error, error);
        }
      });
  }

  generateCaption() {
    this.error = undefined;
    this.caption = undefined;
    this.isLoading = true;
    
    if (!this.textPrompt?.trim()) {
      this.error = 'Please enter a text prompt.';
      this.isLoading = false;
      return;
    }
    
    const body = {
      text_prompt: this.textPrompt
    };
    
    // Log request for debugging
    console.log('Sending caption request:', body);
    
    this.http.post<any>('http://127.0.0.1:5000/generate-caption', body)
      .subscribe({
        next: (response) => {
          console.log('Raw caption response:', response);
          
          // Check if response has caption property
          if (response && response.caption) {
            // Handle double quotes that might be escaped in JSON
            this.caption = response.caption.replace(/^"(.*)"$/, '$1');
            console.log('Clean caption:', this.caption);
          } else {
            this.error = 'Invalid response format from API';
            console.error(this.error, response);
          }
          this.isLoading = false;
        },
        error: (error) => {
          this.error = 'Error generating caption. Please try again.';
          console.error(this.error, error);
          this.isLoading = false;
        }
      });
  }
    
  saveAdWithCaption() {
    if (!this.ad?.id || !this.caption) {
      this.error = 'Ad ID or caption is missing.';
      console.error(this.error);
      return;
    }
    
    const payload = {
      id: this.ad.id,
      caption: this.caption
    };
    
    this.http.put('http://localhost:3000/adImages/update_caption', payload)
      .subscribe({
        next: (response) => {
          console.log('Caption saved:', response);
          alert('Caption saved successfully!');
        },
        error: (error) => {
          this.error = 'Failed to save caption.';
          console.error(this.error, error);
          alert('Failed to save caption.');
        }
      });
  }
}