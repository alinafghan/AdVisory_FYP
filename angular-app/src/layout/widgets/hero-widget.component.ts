import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@Component({
    selector: 'hero-widget',
    imports: [ButtonModule, RippleModule],
    template: `
        <div class="gradient-title-area left-text">
            <div data-aos="zoom-in" data-aos-duration="2000">
                <p class="small-heading">AI-powered tool for smarter, faster ad creation and optimization</p>
            </div>

            <div data-aos="zoom-in" data-aos-duration="2100">
                <h1 class="text-6xl font-bold text-gray-900 leading-tight">
                    <span class="font-light block">Empowering businesses through</span>
                    intelligent, data-driven ad campaigns
                </h1>
            </div>

            <div data-aos="zoom-in" data-aos-duration="2400" data-aos-delay="200">
                <button 
                    pButton 
                    pRipple 
                    [rounded]="true" 
                    type="button" 
                    label="Get Started" 
                    class="!text-xl mt-8 !px-4"
                >
                </button>
            </div>
        </div>
    `
})
export class HeroWidget {}