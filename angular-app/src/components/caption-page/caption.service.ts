import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',  // Could also be added in 'caption.module.ts' under providers
})

export class CaptionService {
  private apiUrl = 'http://localhost:3000/generate-caption'; 

  constructor(private http: HttpClient) {}
}
