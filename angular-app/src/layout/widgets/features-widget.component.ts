import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'features-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div id="features" class="py-6 px-6 lg:px-20 mt-0 mx-0 lg:mx-20">
      <div class="grid grid-cols-12 gap-4 justify-center">
        <div class="col-span-12 text-center mt-8 mb-6">
          <div class="text-[color:var(--text)] font-normal mb-2 text-4xl">Features</div>
          <span class="text-[color:var(--text)] opacity-80 text-2xl">Everything you need to power intelligent, high-performing ad campaigns.</span>
        </div>

        <!-- Card 1: Audience Analysis -->
 <div class="col-span-12 md:col-span-6 lg:col-span-4 p-0 lg:pr-4 lg:pb-8 mt-6 lg:mt-0">
  <div style="height: 180px; padding: 2px; border-radius: 10px; background: linear-gradient(90deg, var(--primary-20), var(--secondary-20)), linear-gradient(180deg, var(--primary-20), var(--accent-20))">
    <div class="p-4 bg-[color:var(--background)] h-full flex flex-col justify-between" style="border-radius: 8px">
      <div class="flex items-center gap-4">
        <div class="flex items-center justify-center bg-[color:var(--primary-20)]" style="width: 3.5rem; height: 3.5rem; border-radius: 10px; flex-shrink: 0;">
          <i class="pi pi-fw pi-users !text-2xl text-[color:var(--primary)]"></i>
        </div>
        <h5 class="text-[color:var(--text)] text-lg font-semibold">Audience Analysis</h5>
      </div>
      <span class="text-[color:var(--text)] opacity-80 text-base leading-relaxed mt-4">Understand exactly who you're targeting with deep, data-backed persona reports.</span>
    </div>
  </div>
</div>

<div class="col-span-12 md:col-span-6 lg:col-span-4 p-0 lg:pr-4 lg:pb-8 mt-6 lg:mt-0">
  <div style="height: 180px; padding: 2px; border-radius: 10px; background: linear-gradient(90deg, var(--secondary-20), var(--accent-20)), linear-gradient(180deg, var(--primary-20), var(--secondary-20))">
    <div class="p-4 bg-[color:var(--background)] h-full flex flex-col justify-between" style="border-radius: 8px">
      <div class="flex items-center gap-4">
        <div class="flex items-center justify-center bg-[color:var(--secondary-20)]" style="width: 3.5rem; height: 3.5rem; border-radius: 10px; flex-shrink: 0;">
          <i class="pi pi-fw pi-cog !text-2xl text-[color:var(--secondary)]"></i>
        </div>
        <h5 class="text-[color:var(--text)] text-lg font-semibold">Campaign Builder</h5>
      </div>
      <span class="text-[color:var(--text)] opacity-80 text-base leading-relaxed mt-4">Set your goals, pick your platforms, and launch campaigns that match.</span>
    </div>
  </div>
</div>

<div class="col-span-12 md:col-span-6 lg:col-span-4 p-0 lg:pb-8 mt-6 lg:mt-0">
  <div style="height: 180px; padding: 2px; border-radius: 10px; background: linear-gradient(90deg, var(--accent-20), var(--primary-20)), linear-gradient(180deg, var(--secondary-20), var(--accent-20))">
    <div class="p-4 bg-[color:var(--background)] h-full flex flex-col justify-between" style="border-radius: 8px">
      <div class="flex items-center gap-4">
        <div class="flex items-center justify-center bg-[color:var(--accent-20)]" style="width: 3.5rem; height: 3.5rem; border-radius: 10px; flex-shrink: 0;">
          <i class="pi pi-fw pi-search !text-2xl text-[color:var(--accent)]"></i>
        </div>
        <h5 class="text-[color:var(--text)] text-lg font-semibold">Competitor Analysis</h5>
      </div>
      <span class="text-[color:var(--text)] opacity-80 text-base leading-relaxed mt-4">Uncover how your rivals market in your niche with competitor ads from Meta Ad Library.</span>
    </div>
  </div>
</div>

<div class="col-span-12 md:col-span-6 lg:col-span-4 p-0 lg:pr-4 lg:pb-8 mt-6 lg:mt-0">
  <div style="height: 180px; padding: 2px; border-radius: 10px; background: linear-gradient(90deg, var(--primary-20), var(--secondary-20)), linear-gradient(180deg, var(--primary-20), var(--accent-20))">
    <div class="p-4 bg-[color:var(--background)] h-full flex flex-col justify-between" style="border-radius: 8px">
      <div class="flex items-center gap-4">
        <div class="flex items-center justify-center bg-[color:var(--primary-20)]" style="width: 3.5rem; height: 3.5rem; border-radius: 10px; flex-shrink: 0;">
          <i class="pi pi-fw pi-lightbulb !text-2xl text-[color:var(--primary)]"></i>
        </div>
        <h5 class="text-[color:var(--text)] text-lg font-semibold">Inspired Ad Generation</h5>
      </div>
      <span class="text-[color:var(--text)] opacity-80 text-base leading-relaxed mt-4">Automatically view inspired ads using campaign metadata and competition intelligence.</span>
    </div>
  </div>
</div>

<div class="col-span-12 md:col-span-6 lg:col-span-4 p-0 lg:pr-4 lg:pb-8 mt-6 lg:mt-0">
  <div style="height: 180px; padding: 2px; border-radius: 10px; background: linear-gradient(90deg, var(--secondary-20), var(--accent-20)), linear-gradient(180deg, var(--primary-20), var(--secondary-20))">
    <div class="p-4 bg-[color:var(--background)] h-full flex flex-col justify-between" style="border-radius: 8px">
      <div class="flex items-center gap-4">
        <div class="flex items-center justify-center bg-[color:var(--secondary-20)]" style="width: 3.5rem; height: 3.5rem; border-radius: 10px; flex-shrink: 0;">
          <i class="pi pi-fw pi-images !text-2xl text-[color:var(--secondary)]"></i>
        </div>
        <h5 class="text-[color:var(--text)] text-lg font-semibold">Product Integration</h5>
      </div>
      <span class="text-[color:var(--text)] opacity-80 text-base leading-relaxed mt-4">Add your own product images directly into ads for a more authentic brand feel.</span>
    </div>
  </div>
</div>

<div class="col-span-12 md:col-span-6 lg:col-span-4 p-0 lg:pb-8 mt-6 lg:mt-0">
  <div style="height: 180px; padding: 2px; border-radius: 10px; background: linear-gradient(90deg, var(--accent-20), var(--primary-20)), linear-gradient(180deg, var(--secondary-20), var(--accent-20))">
    <div class="p-4 bg-[color:var(--background)] h-full flex flex-col justify-between" style="border-radius: 8px">
      <div class="flex items-center gap-4">
        <div class="flex items-center justify-center bg-[color:var(--accent-20)]" style="width: 3.5rem; height: 3.5rem; border-radius: 10px; flex-shrink: 0;">
          <i class="pi pi-fw pi-chart-line !text-2xl text-[color:var(--accent)]"></i>
        </div>
        <h5 class="text-[color:var(--text)] text-lg font-semibold">Budget Optimization</h5>
      </div>
      <span class="text-[color:var(--text)] opacity-80 text-base leading-relaxed mt-4">Design your most profitable campaigns with smart budget allocation to maximize conversion rate.</span>
    </div>
  </div>
</div>

<div
  class="col-span-12 mt-20 mb-20 p-2 md:p-20"
  style="border-radius: 20px; background: linear-gradient(0deg, var(--primary-20), var(--primary-20)), var(--linearPrimaryAccent);"
>
          <div class="flex flex-col justify-center items-center text-center px-4 py-4 md:py-0">
            <img src="assets/logos/advisory-high-resolution-logo-transparent.png" class="mt-6" alt="Company logo" />
            <p class="text-[color:var(--text)] sm:line-height-2 md:line-height-4 text-2xl mt-4" style="max-width: 800px">
              "AdVisory empowers brands to create smarter, data-driven campaigns with ease. From real-time analytics to AI-generated content, we simplify social media marketing—so you can focus on what matters: growing your business and reaching the right audience."
            </p>
            
          </div>
        </div>
      </div>
    </div>
  `,
})
export class FeaturesWidget {}