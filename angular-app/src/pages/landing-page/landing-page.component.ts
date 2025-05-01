import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ButtonComponent } from '../../components/button/button.component';
import { LucideAngularModule, FileIcon, ChartBar, ChartNoAxesColumn, User, ArrowRight, DollarSign } from 'lucide-angular';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [RouterModule, CommonModule, NavbarComponent, FooterComponent, ButtonComponent, LucideAngularModule], 
  templateUrl: './home.component.html',
})
export class LandingComponent {
  logoPath = 'assets/logos/advisory-logo.png';
  readonly FileIcon = FileIcon;
  readonly ChartBar = ChartBar;
  readonly NoAxesColumn = ChartNoAxesColumn;
  readonly User = User;
  readonly ArrowRight = ArrowRight;
  readonly DollarSign = DollarSign;
}


