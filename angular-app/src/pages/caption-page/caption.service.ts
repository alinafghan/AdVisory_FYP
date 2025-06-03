import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CaptionService {
  private apiUrl = 'http://127.0.0.1:5000/generate-caption';

  constructor(private http: HttpClient) {}

  /**
   * Generate a caption based on text prompt
   * @param textPrompt The text description to generate a caption from
   */
  generateCaptionFromText(textPrompt: string): Observable<{ caption: string }> {
    return this.http.post<{ caption: string }>(this.apiUrl, {
      text_prompt: textPrompt
    });
  }

  /**
   * Generate a caption based on image
   * @param imageBase64 The base64 encoded image data
   */
  generateCaptionFromImage(imageBase64: string): Observable<{ caption: string }> {
    return this.http.post<{ caption: string }>(this.apiUrl, {
      image_base64: imageBase64
    });
  }

  /**
   * Save caption with ad
   * @param adId The ID of the ad
   * @param caption The caption to save
   */
  saveCaption(adId: string, caption: string): Observable<any> {
    return this.http.put('http://localhost:3000/adImages/update_caption', {
      id: adId,
      caption: caption
    });
  }
}