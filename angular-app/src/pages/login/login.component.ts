import { Component, Input, AfterViewInit } from '@angular/core';
import { User } from '../../interfaces/user';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FooterComponent } from '../../components/footer/footer.component';
import { LucideAngularModule, Facebook } from 'lucide-angular';
import { AppTopbar } from '../../layout/component/app.topbar';

// Declare the Gradient object if it's a global script
declare const Gradient: any;

@Component({
    selector: 'login',
    imports: [FormsModule, FooterComponent, LucideAngularModule, AppTopbar],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})

// Implement AfterViewInit
export class LoginComponent implements AfterViewInit {

    gradientInstance: any;
    // Tilt angle matching the CSS --section-skew-Y or the hardcoded value
    tiltAngleDegrees = 12;

    user: User = { username: '', password: '' };
    errorMessage: string = '';

    constructor(private authService: AuthService, private router: Router) {}

    ngOnInit() {
        // If redirected from Facebook login, check if there's a token in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (token) {
            console.log('Facebook login successful, storing token');
            localStorage.setItem('authToken', token); // Save token
            this.router.navigate(['/home']); // Redirect to home
        }
    }

    // Implement ngAfterViewInit to initialize the gradient
    ngAfterViewInit(): void {
        // Check if the Gradient class is available
        if (typeof Gradient !== 'undefined') {
            // Initialize the gradient with custom settings
            this.gradientInstance = new Gradient();

            // Set angle (convert degrees to radians)
            this.gradientInstance.angle = this.tiltAngleDegrees * Math.PI / 180;

            // Optional customizations - these match what you have in landing page
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

    onSubmit() {
        console.log('Submitting user data:', this.user);

        this.authService.login(this.user).subscribe(
            (response: any) => {
                console.log('Login successful', response);
                localStorage.setItem('authToken', response.token);
                this.router.navigate(['/home']);
            },
            (error: any) => {
                console.error('Login failed', error);
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

    onfblogin() {
        console.log('Redirecting to Facebook login...');
        this.authService.fblogin();
    }
}