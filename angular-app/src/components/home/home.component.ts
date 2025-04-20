import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../styles/style_components/navbar/navbar.component';
import { FooterComponent } from '../../styles/style_components/footer/footer.component';
import { ButtonComponent } from '../../styles/style_components/button/button.component';
import { LucideAngularModule, FileIcon, ChartBar, ChartNoAxesColumn, User, ArrowRight, DollarSign } from 'lucide-angular';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [RouterModule, CommonModule, NavbarComponent, FooterComponent, ButtonComponent, LucideAngularModule], 
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  logoPath = 'assets/logos/advisory-logo.png';
  readonly FileIcon = FileIcon;
  readonly ChartBar = ChartBar;
  readonly NoAxesColumn = ChartNoAxesColumn;
  readonly User = User;
  readonly ArrowRight = ArrowRight;
  readonly DollarSign = DollarSign;
}


