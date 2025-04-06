import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule
import { AppComponent } from '../../app/app.component'
import { CaptionGeneratorComponent } from './caption-generator.component';

@NgModule({
    declarations: [
        AppComponent,
        CaptionGeneratorComponent
    ],
    imports: [
        BrowserModule,
        FormsModule, // Add FormsModule here
        HttpClientModule // Add HttpClientModule here
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
