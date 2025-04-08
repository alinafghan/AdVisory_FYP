// app.module.ts (if using modules) or app.routes.ts (if using standalone components)

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from '../../app/app.component';
import { HeaderComponent } from '../header.component';
import { FluxPageComponent } from './flux-page.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot([
      { path: '', component: FluxPageComponent },
      { path: 'flux', component: FluxPageComponent },
      // Add more routes as needed
    ]),
    HeaderComponent, 
    FluxPageComponent 
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }