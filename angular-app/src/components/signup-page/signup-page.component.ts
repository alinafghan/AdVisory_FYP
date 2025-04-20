import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signup-page',
  templateUrl: './signup-page.component.html',
  styleUrls: ['./signup-page.component.css'],
  standalone: true,
  imports: [FormsModule]
})
export class SignupPageComponent {
  username: string = '';
  email: string = '';
  businessName: string = '';
  businessType: string = '';
  firstName: string = '';
  password: string = '';
  selectedLogo: File | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  // Handle file selection
  onFileSelected(event: any) {
    this.selectedLogo = event.target.files[0];
  }

  // Handle form submission
  onSubmit() {
    const formData = {
      username: this.username,
      email: this.email,
      businessName: this.businessName,
      businessType: this.businessType,
      firstName: this.firstName,
      password: this.password,
      businessLogo: this.selectedLogo ? this.selectedLogo : null,  // Only include logo if selected
    };

    // Log the JSON object for debugging
    console.log('Sending data:', formData);

    // Send the data as a JSON object
    this.http.post('http://localhost:3000/auth/register', formData)
      .subscribe(
        (response: any) => {
          console.log(response);  // Log success response
          this.router.navigate(['/home']);
        },
        (error) => {
          console.error('Error during signup:', error);
          alert('Signup failed. Please try again.');
        }
      );
  }
}
