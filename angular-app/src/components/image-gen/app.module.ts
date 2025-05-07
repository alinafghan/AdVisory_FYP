// app.module.ts (if using modules) or app.routes.ts (if using standalone components)

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from '../../app/app.component';
import { FluxPageComponent } from './image-gen.component';
import { FormsModule } from '@angular/forms';
import { CompetitorAdsComponent } from '../competitor-ads/competitor-ads.component'; // Adjust the import path as necessary

@NgModule({
  declarations: [
    // other components
    FluxPageComponent,
    CompetitorAdsComponent

  ],
  imports: [
    BrowserModule,
    HttpClientModule,  // Include HttpClientModule here
    FormsModule        // Include FormsModule for ngModel
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
