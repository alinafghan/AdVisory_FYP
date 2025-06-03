import { Component } from '@angular/core';
import { ProductAdComponent } from '../../reusable-components/productad-page/productad.component';
import { AppTopbar } from '../../layout/component/app.topbar';
import { SidebarComponent } from '../../layout/component/app.sidebar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-image-page',
  imports: [FormsModule, CommonModule, SidebarComponent,  AppTopbar, ProductAdComponent],
  templateUrl: './product-image-page.component.html',
  styleUrl: './product-image-page.component.css'
})
export class ProductImagePageComponent {

}
