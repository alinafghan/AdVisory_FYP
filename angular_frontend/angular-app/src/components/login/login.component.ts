import { Component, Input } from '@angular/core';
import { User } from '../../interfaces/user';
import { AuthService } from '../../services/auth.service'; // Import the auth service
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';  

@Component({
  selector: 'login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent {
  user: User = { username: '', password: '' };
  errorMessage: string = ''; 

   constructor(private authService: AuthService, private router: Router) {}

   onSubmit() {
    console.log('Submitting user data:', this.user);

    this.authService.login(this.user).subscribe(
      (response: any) => {
        console.log('Login successful', response);

        // Store token or other necessary info here, e.g., localStorage or sessionStorage
        localStorage.setItem('authToken', response.token);

        // Redirect to /home on successful login
        this.router.navigate(['/home']);
      },
      (error: any) => {
        console.error('Login failed', error);

        // Set the error message to be displayed on the homepage
        if (error.status === 404) {
          this.errorMessage = 'User not found. Please check your username.';
        } else if (error.status === 401) {
          this.errorMessage = 'Incorrect password. Please try again.';
        } else {
          this.errorMessage = 'An error occurred. Please try again later.';
        }
      }
    );
  }
}
