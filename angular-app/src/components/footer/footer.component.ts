import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();
  companyName: string = 'AdVisory'; // Replace with your actual company name
  socialLinks = [
    { name: 'Facebook', url: '#' }, // Replace '#' with actual URLs
    { name: 'Twitter', url: '#' },
    { name: 'LinkedIn', url: '#' },
    { name: 'Instagram', url: '#' },
  ];
  contactInfo = {
    address: '123 Main Street, Karachi, Pakistan', // Replace with your actual address
    email: 'info@advisory.com', // Replace with your actual email
    phone: '+92 300 1234567', // Replace with your actual phone number
  };
  navigationLinks = [
    { label: 'Home', url: '/' },
    { label: 'About Us', url: '/about' },
    { label: 'Services', url: '/services' },
    { label: 'Contact', url: '/contact' },
    { label: 'Privacy Policy', url: '/privacy' },
  ];
}