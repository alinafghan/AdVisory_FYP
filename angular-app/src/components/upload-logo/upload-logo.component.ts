// upload-logo.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-upload-logo',
  templateUrl: './upload-logo.component.html',
  styleUrls: ['./upload-logo.component.css']
})
export class UploadLogoComponent {
  selectedLogo: File | null = null;

  constructor(private router: Router) {}

  onFileSelected(event: any) {
    this.selectedLogo = event.target.files[0];
  }

  onSubmit() {
    if (this.selectedLogo) {
      // You can handle the file upload logic here.
      // For example, make an HTTP POST request to upload the file to the server
      console.log('Logo uploaded:', this.selectedLogo);
      
      // After successful logo upload, navigate to the next page (e.g., dashboard or home)
      this.router.navigate(['/dashboard']);  // Update this to your desired route
    } else {
      alert('Please select a logo file.');
    }
  }
}
