import { Routes } from '@angular/router';
import { HomeComponent } from '../pages/home-page/home.component';
import { BudgetPageComponent } from '../pages/budget-page/budget-page.component';
import { TrendsComponent } from '../components/trends-page/trends-page.component';
import { FluxPageComponent } from '../components/flux-page/flux-page.component';
import {MetricsPageComponent} from '../components/metrics-page/metrics-page.component';
import { ManageCampaignComponent } from '../components/manage-campaign/manage-campaign.component';
import { LoginComponent } from '../components/login/login.component';
import { SignupPageComponent } from '../components/signup-page/signup-page.component';
import { CampaignComponent } from '../components/campaign/campaign.component';
import { SelectedCampaignComponent } from '../components/selected-campaign/selected-campaign.component';
import { CaptionPageComponent } from '../components/caption-page/caption-page.component';
import { PipelineComponent } from '../components/pipeline/pipeline.component';
import { LandingComponent } from '../components/home/home.component';
import { TrendsComponent } from '../pages/trends-page/trends-page.component';
import { FluxPageComponent } from '../pages/flux-page/flux-page.component';
import {MetricsPageComponent} from '../pages/metrics-page/metrics-page.component';
import { ManageCampaignComponent } from '../pages/manage-campaign/manage-campaign.component';
import { LoginComponent } from '../pages/login/login.component';
import { SignupPageComponent } from '../pages/signup-page/signup-page.component';
import { CampaignComponent } from '../pages/campaign/campaign.component';
import { SelectedCampaignComponent } from '../pages/selected-campaign/selected-campaign.component';
import { CaptionPageComponent } from '../pages/caption-page/caption-page.component';
import { PipelineComponent } from '../pages/pipeline/pipeline.component';
import { LandingPageComponent } from '../pages/landing-page/landing-page.component';
import { TargetAudienceComponent } from '../pages/target-audience/target-audience.component';


export const routes: Routes = [
    {path:'landing', component: LandingComponent},
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: '', redirectTo: '/landingpage', pathMatch: 'full' },
    { path: 'landingpage', component: LandingPageComponent },
    { path: 'home', component: HomeComponent },
    {path: 'budget', component: BudgetPageComponent},
    {path: 'trends', component: TrendsComponent},
    { path: 'flux', component: FluxPageComponent },
    {path: 'metrics', component: MetricsPageComponent},
    {path: 'login', component : LoginComponent},
    {path: 'signup', component: SignupPageComponent},
    {path:'manage_campaign', component : ManageCampaignComponent},
    {path: 'selected_campaign/:campaignId', component : SelectedCampaignComponent},
    {path: 'campaign', component : CampaignComponent},
    // {path: '**', redirectTo: '/home'}
    { path: 'caption', component: CaptionPageComponent },
    {path:'pipeline', component: PipelineComponent},
    { path: 'targetaudience/:id', component: TargetAudienceComponent },

];