import { Component, AfterViewInit } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { LucideAngularModule } from 'lucide-angular';

declare const Gradient: any;

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css'],
  standalone: true,
  imports: [
    FooterComponent,
    NavbarComponent,
    LucideAngularModule
  ]
})
export class LandingPageComponent implements AfterViewInit {
  gradientInstance: any;

  // Tilt angle matching the CSS --section-skew-Y (positive now)
  tiltAngleDegrees = 12; // CHANGED: from -12 to 12 to match updated CSS

  ngAfterViewInit(): void {
    // Initialize the gradient with custom settings
    this.gradientInstance = new Gradient();

    // Set angle (convert degrees to radians)
    // We don't need to add 180 degrees anymore, as we're fixing it in CSS
    this.gradientInstance.angle = this.tiltAngleDegrees * Math.PI / 180;

    // Optional customizations for the gradient effect
    // this.gradientInstance.amp = 50; // Amplitude of the noise - try different values
    // this.gradientInstance.speed = 0.07; // Speed of the animation
    // this.gradientInstance.freqX = 0.012; // Frequency of the horizontal movement
    // this.gradientInstance.freqY = 0.012; // Frequency of the vertical movement

    // Initialize the gradient on the canvas
    this.gradientInstance.initGradient('#gradient-canvas');
  }
}