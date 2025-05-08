import { Routes } from '@angular/router';
import { HomeComponent } from '../pages/home/home.component';
import { BudgetPageComponent } from '../pages/budget-page/budget-page.component';
import { TrendsComponent } from '../components/trends-page/trends-page.component';
import { FluxPageComponent } from '../components/image-gen/image-gen.component';
import {MetricsPageComponent} from '../components/metrics-page/metrics-page.component';
import { ManageCampaignComponent } from '../components/manage-campaign/manage-campaign.component';
import { LoginComponent } from '../components/login/login.component';
import { SignupPageComponent } from '../components/signup-page/signup-page.component';
import { CampaignComponent } from '../components/campaign/campaign.component';
import { SelectedCampaignComponent } from '../components/selected-campaign/selected-campaign.component';
import { CaptionPageComponent } from '../components/caption-page/caption-page.component';
import { ProductAdComponent } from '../components/productad-page/productad.component';
import { ProductAdCustomComponent } from '../components/productad-page/productadcustom.component';
import { PipelineComponent } from '../components/pipeline/pipeline.component';
import { LandingComponent } from '../components/home/home.component';
import { TosPageComponent } from '../pages/tos-page/tos-page.component';
import { PpPageComponent } from '../pages/pp-page/pp-page.component';


export const routes: Routes = [
    {path:'landing', component: LandingComponent},
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    {path: 'budget', component: BudgetPageComponent},
    {path: 'trends', component: TrendsComponent},
    { path: 'flux', component: FluxPageComponent },
    {path: 'metrics', component: MetricsPageComponent},
    {path: 'login', component : LoginComponent},
    {path:'terms_of_service', component : TosPageComponent},
    {path: 'privacy_policy', component : PpPageComponent},
    {path: 'signup', component: SignupPageComponent},
    {path:'manage_campaign', component : ManageCampaignComponent},
    {path: 'selected_campaign/:campaignId', component : SelectedCampaignComponent},
    {path: 'campaign', component : CampaignComponent},
    // {path: '**', redirectTo: '/home'}
    { path: 'caption', component: CaptionPageComponent },
    {path: 'productad', component : ProductAdComponent},
    {path: 'productadcustom', component : ProductAdCustomComponent},
    {path:'pipeline', component: PipelineComponent},

];