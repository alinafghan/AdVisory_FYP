import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router'; // To get imageId from URL
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-caption-page',
  templateUrl: './caption-page.component.html',
  styleUrls: ['./caption-page.component.css'],
  imports: [CommonModule, FormsModule],
  standalone: true
})
export class CaptionPageComponent implements OnInit {
  textPrompt?: string;
  imageUrl?: string;
  imageBase64?: string;
  caption?: string;
  ad?: any;

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const imageId = this.route.snapshot.queryParamMap.get('ad');
    if (imageId) {
      this.fetchAdImage(imageId);
    }
  }

  fetchAdImage(imageId: string) {
    this.http.get<any>(`http://localhost:3000/adImages/${imageId}`)
      .subscribe(response => {
        this.ad = response;
      }, error => {
        console.error('Error fetching ad:', error);
      });
  }

  generateCaption() {
    const body = this.imageBase64
      ? { image_base64: this.imageBase64 }
      : this.imageUrl
        ? { image_url: this.imageUrl }
        : this.textPrompt
          ? { text_prompt: this.textPrompt }
          : {};

    this.http.post<{ caption: string }>('http://127.0.0.1:5000/generate-caption', body)
      .subscribe(response => {
        this.caption = response.caption;
      }, error => {
        console.error('Error generating caption:', error);
      });
  }

  convertToBase64(event: Event) {
    const element = event.target as HTMLInputElement;
    const file = element.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imageBase64 = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  saveAdWithCaption() {
    console.log('Saving ad with caption:', this.ad, this.caption);
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
