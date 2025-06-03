import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http'; // Add HttpClientModule
import { AppComponent } from '../../app/app.component';
import { CaptionPageComponent } from './caption-page.component';

@NgModule({
  declarations: [
    AppComponent,
    CaptionPageComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule // Add HttpClientModule here
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }