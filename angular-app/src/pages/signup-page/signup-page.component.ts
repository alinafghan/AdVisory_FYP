import { Component, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../../components/footer/footer.component';
import { AppTopbar } from '../../layout/component/app.topbar';

// Declare the Gradient object if it's a global script
declare const Gradient: any;

@Component({
  selector: 'app-signup-page',
  templateUrl: './signup-page.component.html',
  styleUrls: ['./signup-page.component.css'],
  standalone: true,
  imports: [FormsModule, FooterComponent, AppTopbar],
})
export class SignupPageComponent implements AfterViewInit {
  
  gradientInstance: any;
  // Tilt angle matching the CSS --section-skew-Y or the hardcoded value
  tiltAngleDegrees = 12;

  username: string = '';
  email: string = '';
  businessName: string = '';
  businessType: string = '';
  firstName: string = '';
  password: string = '';
  selectedLogo: File | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  // Implement ngAfterViewInit to initialize the gradient
  ngAfterViewInit(): void {
    // Check if the Gradient class is available
    if (typeof Gradient !== 'undefined') {
      // Initialize the gradient with custom settings
      this.gradientInstance = new Gradient();

      // Set angle (convert degrees to radians)
      this.gradientInstance.angle = this.tiltAngleDegrees * Math.PI / 180;

      // Optional customizations - these match what you have in login page
      // Uncomment if you want to use them
      // this.gradientInstance.amp = 50;
      // this.gradientInstance.speed = 0.07;
      // this.gradientInstance.freqX = 0.012;
      // this.gradientInstance.freqY = 0.012;

      // Initialize the gradient on the canvas - make sure this ID matches your HTML
      this.gradientInstance.initGradient('#gradient-canvas');
    } else {
      console.error('Gradient class not found. Make sure the gradient script is loaded.');
    }
  }

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