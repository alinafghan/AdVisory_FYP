import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';  // Ensure FormsModule is imported
import { AppComponent } from '../../app/app.component';
import { CaptionPageComponent } from './caption-page.component';  // Adjust the path as necessary

@NgModule({
  declarations: [
    AppComponent,
    CaptionPageComponent  // Your component should be declared here
  ],
  imports: [
    BrowserModule,
    FormsModule  // Add FormsModule here
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
