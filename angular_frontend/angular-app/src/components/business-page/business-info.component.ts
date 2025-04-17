// business-info.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';  // Import CommonModule
import { Router } from '@angular/router';  // Import Router

@Component({
  selector: 'app-business-info',
  templateUrl: './business-info.component.html',
  styleUrls: ['./business-info.component.css'],
  standalone: true,
  imports: [CommonModule]  // Add CommonModule to imports
})
export class BusinessInfoComponent {
  businessTypes = [
    { name: 'Retail', image: 'assets/retail.jpg' },
    { name: 'Consulting', image: 'assets/consulting.jpg' },
    { name: 'Technology', image: 'assets/technology.jpg' },
    { name: 'Healthcare', image: 'assets/healthcare.jpg' },
  ];
  selectedBusinessType: string = '';
  userFirstName: string = 'User'; // Assume you pass this from the signup form

  constructor(private router: Router) {}

  selectBusinessType(businessType: string) {
    this.selectedBusinessType = businessType;
    // Handle saving the business type selection here
    console.log(`Business type selected: ${businessType}`);
    // After selecting a business type, navigate to the next page
    this.router.navigate(['/upload-logo']);
  }
}
