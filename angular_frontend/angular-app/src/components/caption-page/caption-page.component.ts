import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';  // Needed for ngModel
import { CommonModule } from '@angular/common';  // Needed for *ngIf

interface CaptionResponse {
    caption: string;
}
@Component({
    selector: 'app-caption-page',
    templateUrl: './caption-page.component.html',
    styleUrls: ['./caption-page.component.css'],
    imports: [CommonModule, FormsModule],  // Include CommonModule and FormsModule here
    standalone: true
})
export class CaptionPageComponent {
    textPrompt?: string;
    imageUrl?: string;
    imageBase64?: string;
    caption?: string;

    constructor(private http: HttpClient) {}

    generateCaption() {
        const body = this.imageBase64 ? { image_base64: this.imageBase64 } : 
                     this.imageUrl ? { image_url: this.imageUrl } :
                     this.textPrompt ? { text_prompt: this.textPrompt } : {};

        console.log('Request body:', body);  // Debugging line to check the request body
        this.http.post<CaptionResponse>('http://127.0.0.1:5000/generate-caption', body)
            .subscribe(response => {
                this.caption = response.caption;
            }, error => {
                console.error('Error generating caption:', error);
            });
    }

    convertToBase64(event: Event) {
        const element = event.target as HTMLInputElement;
        const file = element.files ? element.files[0] : null;
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                this.imageBase64 = reader.result as string;
            };
        }
    }
}
