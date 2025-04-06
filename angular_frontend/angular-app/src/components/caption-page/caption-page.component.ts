import { Component, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface CaptionResponse {
    caption: string;
}

@Component({
    selector: 'app-caption-page',
    templateUrl: './caption-page.component.html',
    styleUrls: ['./caption-page.component.css'],
    standalone: true,
    imports: [
        CommonModule, // Includes NgIf, NgFor, etc.
        FormsModule,  // Enables ngModel
        HttpClientModule
    ]
})
export class CaptionPageComponent {
    textPrompt?: string;
    imageUrl?: string;
    caption?: string;

    constructor(private http: HttpClient) {}

    generateCaption() {
        const body = this.imageUrl ? { image_url: this.imageUrl } :
                     this.textPrompt ? { text_prompt: this.textPrompt } : {};

        this.http.post<CaptionResponse>('http://127.0.0.1:5000/generate-caption', body)
            .subscribe(response => {
                this.caption = response.caption;
            }, error => {
                console.error('Error generating caption:', error);
            });
    }
}
