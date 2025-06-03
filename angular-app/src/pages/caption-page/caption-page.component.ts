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
        console.error('No ad image ID found in the URL or service.');
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
          console.error('Error fetching ad:', error);
        }
      });
  }

  generateCaption() {
  this.caption = undefined;
  this.isLoading = true;

  let body: any = {};

  if (this.captionSource === 'text') {
    if (!this.textPrompt?.trim()) {
      alert('Please enter a text prompt.');
      this.isLoading = false;
      return;
    }
    body = { text_prompt: this.textPrompt };
  } else if (this.captionSource === 'image') {
    if (!this.ad?.imageData) {
      alert('No image data available.');
      this.isLoading = false;
      return;
    }
    body = { image_base64: this.ad.imageData };
  }

  this.http.post<{ caption: string }>('http://127.0.0.1:5000/generate-caption', body)
    .subscribe({
      next: (response) => {
        this.caption = response.caption;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error generating caption:', error);
        this.caption = 'Error generating caption.';
        this.isLoading = false;
      }
    });
}


  saveAdWithCaption() {
    if (!this.ad?.id || !this.caption) {
      console.error('Ad ID or caption is missing.');
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
          console.error('Error saving caption:', error);
          alert('Failed to save caption.');
        }
      });
  }
}