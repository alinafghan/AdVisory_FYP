import { Routes } from '@angular/router';
import { HomeComponent } from '../components/home/home.component';
import { BudgetPageComponent } from '../components/budget-page/budget-page.component';
import { TrendsComponent } from '../components/trends-page/trends-page.component';
import { FluxPageComponent } from '../components/flux-page/flux-page.component';
import {MetricsPageComponent} from '../components/metrics-page/metrics-page.component';
import { ManageCampaignComponent } from '../components/manage-campaign/manage-campaign.component';
import { LoginComponent } from '../components/login/login.component';
import { CampaignComponent } from '../components/campaign/campaign.component';
import { SelectedCampaignComponent } from '../components/selected-campaign/selected-campaign.component';
import { CaptionPageComponent } from '../components/caption-page/caption-page.component';


export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    {path: 'budget', component: BudgetPageComponent},
    {path: 'trends', component: TrendsComponent},
    { path: 'flux', component: FluxPageComponent },
    {path: 'metrics', component: MetricsPageComponent},
    {path: 'login', component : LoginComponent},
    {path:'manage_campaign', component : ManageCampaignComponent},
    {path: 'selected_campaign/:campaignId', component : SelectedCampaignComponent},
    {path: 'campaign', component : CampaignComponent},
    // {path: '**', redirectTo: '/home'}
    { path: 'caption', component: CaptionPageComponent },

];