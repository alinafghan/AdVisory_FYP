import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MrrComponent } from './mrr.component';

@Component({
  selector: 'app-productadcustom-page',
  standalone: true,
  imports: [CommonModule, FormsModule, MrrComponent],
  templateUrl: './productadcustom.component.html',
  styleUrls: ['./productadcustom.css']
 
})
export class ProductAdCustomComponent implements OnInit, AfterViewInit {
  productImage: string | null = null;
  selectedBackground: string = '';
  backgrounds: string[] = ['assets/1.png', 'assets/2.png', 'assets/3.png'];

  ngOnInit() {
    this.productImage = sessionStorage.getItem('uploadedImage'); // Retrieve from session storage
  }

  ngAfterViewInit() {}

  selectBackground(bg: string) {
    this.selectedBackground = bg;
  }
}