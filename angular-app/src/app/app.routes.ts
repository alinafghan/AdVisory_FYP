import { Routes } from '@angular/router';
import { HomeComponent } from '../pages/home/home.component';
import { BudgetPageComponent } from '../pages/budget-page/budget-page.component';
import { TrendsComponent } from '../pages/trends-page/trends-page.component';
import { FluxPageComponent } from '../reusable-components/image-gen/image-gen.component';
import { MetricsPageComponent } from '../pages/metrics-page/metrics-page.component';
import { ManageCampaignComponent } from '../pages/manage-campaign/manage-campaign.component';
import { LoginComponent } from '../pages/login/login.component';
import { SignupPageComponent } from '../pages/signup-page/signup-page.component';
import { CampaignComponent } from '../reusable-components/campaign/campaign.component';
import { SelectedCampaignComponent } from '../pages/selected-campaign/selected-campaign.component';
import { CaptionPageComponent } from '../pages/caption-page/caption-page.component';
import { PipelineComponent } from '../reusable-components/pipeline/pipeline.component';
import { LandingPageComponent } from '../pages/landing-page/landing-page.component';
import { TargetAudienceComponent } from '../pages/target-audience/target-audience.component';
import { ProductAdComponent } from '../reusable-components/productad-page/productad.component'; // Corrected path
import { ProductAdCustomComponent } from '../reusable-components/productad-page/productadcustom.component'; // Corrected path
import { TosPageComponent } from '../pages/tos-page/tos-page.component';
import { PpPageComponent } from '../pages/pp-page/pp-page.component';
import { InspiredAdsPageComponent } from '../pages/inspired-ads-page/inspired-ads-page.component';
import { ProductImagePageComponent } from '../pages/product-image-page/product-image-page.component';

export const routes: Routes = [
  { path: 'landing', component: LandingPageComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'budget', component: BudgetPageComponent },
  { path: 'trends', component: TrendsComponent },
  { path: 'flux', component: FluxPageComponent },
  { path: 'metrics', component: MetricsPageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'terms_of_service', component: TosPageComponent },
  { path: 'privacy_policy', component: PpPageComponent },
  { path: 'signup', component: SignupPageComponent },
  { path: 'manage_campaign', component: ManageCampaignComponent },
  { path: 'selected_campaign/:campaignId', component: SelectedCampaignComponent },
  { path: 'campaign', component: CampaignComponent },
  { path: 'caption', component: CaptionPageComponent },
  { path: 'pipeline', component: PipelineComponent },
  { path: 'targetaudience/:id', component: TargetAudienceComponent },
  { path: 'productad', component: ProductAdComponent },
  { path: 'productadcustom', component: ProductAdCustomComponent },
  { path: 'inspired_ads', component: InspiredAdsPageComponent },
  { path: 'product_images', component: ProductImagePageComponent },

];
