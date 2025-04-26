import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
// @ts-ignore
import AOS from 'aos'; 
import 'aos/dist/aos.css';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'angular-app';
  ngOnInit() {
    // Initialize AOS
    AOS.init();
  }
}