import { Routes } from '@angular/router';
import { HomeComponent } from '../components/home/home.component';
import { BudgetPageComponent } from '../components/budget-page/budget-page.component';
import { TrendsComponent } from '../components/trends-page/trends-page.component';
import { FluxPageComponent } from '../components/flux-page/flux-page.component';
import {MetricsPageComponent} from '../components/metrics-page/metrics-page.component';
import { RouterModule } from '@angular/router';
import { LoginComponent } from '../components/login/login.component';
import { SignupPageComponent } from '../components/signup-page/signup-page.component';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    {path: 'budget', component: BudgetPageComponent},
    {path: 'trends', component: TrendsComponent},
    { path: 'flux', component: FluxPageComponent },
    {path: 'metrics', component: MetricsPageComponent},
    {path: 'login', component : LoginComponent},
    {path: 'signup', component: SignupPageComponent},
];