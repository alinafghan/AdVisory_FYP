import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router'; // ✅ Import RouterModule
import { HttpClient } from '@angular/common/http'; // ✅ Import HttpClient

@Component({
  selector: 'app-productad-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // ✅ Add RouterModule
  templateUrl: './productad.component.html',
  styleUrls: ['./productad.component.css']
})
export class ProductAdComponent {
  originalImageUrl: string | ArrayBuffer | null = null;
  imageUrl: string | ArrayBuffer | null = null;
  imageProcessed: boolean = false;
  selectedFile: File | null = null;
  isLoading: boolean = false;

  constructor(private router: Router, private http: HttpClient) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.originalImageUrl = reader.result;
        this.imageUrl = null; // Reset processed image
        this.imageProcessed = false;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  removeBackground(): void {
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('image', this.selectedFile);
    this.isLoading = true;

    this.http.post('http://127.0.0.1:5000/remove-bg', formData, { responseType: 'blob' })
      .subscribe(
        (response: Blob) => {
          const processedImageUrl = URL.createObjectURL(response);
          this.imageUrl = processedImageUrl;
          this.imageProcessed = true;
          this.isLoading = false;

          const reader = new FileReader();
          reader.onload = () => {
            sessionStorage.setItem('uploadedImage', reader.result as string);
            sessionStorage.setItem('fileName', this.selectedFile!.name);
          };
          reader.readAsDataURL(response);
        },
        error => {
          console.error('Error processing image:', error);
          this.isLoading = false;
          this.imageProcessed = false;
        }
      );
  }

  navigateToCustomPage(): void {
    this.router.navigate(['/productadcustom']);
  }
}
