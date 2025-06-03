import { Component } from '@angular/core';
import { AppTopbar } from '../../layout/component/app.topbar';
import { SidebarComponent } from '../../layout/component/app.sidebar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FluxPageComponent } from '../../reusable-components/image-gen/image-gen.component';

@Component({
  selector: 'app-inspired-ads-page',
  imports: [FormsModule, CommonModule, SidebarComponent,  AppTopbar, FluxPageComponent],
  templateUrl: './inspired-ads-page.component.html',
  styleUrl: './inspired-ads-page.component.css'
})
export class InspiredAdsPageComponent {

}
