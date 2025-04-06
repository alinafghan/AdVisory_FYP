import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface ApiResponse {
    caption: string;  // Adjust this according to the actual response structure
}

@Component({
    selector: 'app-caption-generator',
    templateUrl: './caption-generator.component.html',
    styleUrls: ['./caption-generator.component.css']
})
export class CaptionGeneratorComponent {
    textPrompt?: string;
    imageUrl?: string;
    imageBase64?: string;
    caption?: string;

    constructor(private http: HttpClient) {}

    generateCaption() {
        const body = this.textPrompt ? { text_prompt: this.textPrompt } :
                      this.imageUrl ? { image_url: this.imageUrl } :
                      { image_base64: this.imageBase64 };

        // Specify ApiResponse as the expected response type
        this.http.post<ApiResponse>('http://127.0.0.1:5000/generate-caption', body)
            .subscribe(response => {
                this.caption = response.caption;  // Now TypeScript knows that 'caption' exists
            }, error => {
                console.error('Error generating caption:', error);
            });
    }

    convertToBase64(event: any) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            this.imageBase64 = reader.result as string;
        };
    }
}
