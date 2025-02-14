import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { BudgetPageComponent } from './budget-page/budget-page.component';
import { TrendsComponent } from './trends-page/trends-page.component';
import { FluxPageComponent } from './flux-page/flux-page.component';
import {MetricsPageComponent} from './metrics-page/metrics-page.component';
import { RouterModule } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    {path: 'budget', component: BudgetPageComponent},
    {path: 'trends', component: TrendsComponent},
    { path: 'flux', component: FluxPageComponent },
    {path: 'metrics', component: MetricsPageComponent}
];