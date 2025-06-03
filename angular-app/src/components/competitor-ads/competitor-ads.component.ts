import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { AdDataService } from '../../services/ad-data-service';
import { interval, Subscription } from 'rxjs';
import { switchMap, takeWhile } from 'rxjs/operators';

// Declare JSZip for TypeScript
declare var JSZip: any;

@Component({
  selector: 'app-competitor-ads',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, FormsModule],
  templateUrl: './competitor-ads.component.html',
  styleUrls: ['./competitor-ads.component.scss']
})
export class CompetitorAdsComponent implements OnInit, OnDestroy {
  competitorAds: any[] = [];
  generatedAds: any[] = [];
  
  loadingCompetitorAds = true;
  loadingGeneratedAds = true;
  downloadingZip = false;
  encodeURIComponent = encodeURIComponent;

  // Generation tracking
  currentJobId: string | null = null;
  generationStatus: 'idle' | 'generating' | 'completed' | 'error' = 'idle';
  generationProgress = 0; // 0-100
  statusPollingSubscription?: Subscription;

  // Image loading states
  imageLoaded: { [key: string]: boolean } = {};
  genImageLoaded: { [key: string]: boolean } = {};

  // Fixes for binding in HTML
  ads: any[] = [];
  keywords: string = '';
  loading: boolean = false;
  error: string | null = null;

  constructor(
    private adDataService: AdDataService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadExistingData();
    this.checkForOngoingGeneration();
  }

  ngOnDestroy(): void {
    if (this.statusPollingSubscription) {
      this.statusPollingSubscription.unsubscribe();
    }
  }

  private loadExistingData(): void {
    const loadedCompetitors = this.adDataService.getCompetitorAds();
    const loadedGenerated = this.adDataService.getGeneratedAds();

    this.loadingCompetitorAds = !loadedCompetitors || loadedCompetitors.length === 0;
    this.loadingGeneratedAds = !loadedGenerated || loadedGenerated.length === 0;

    this.competitorAds = loadedCompetitors || [];
    this.generatedAds = loadedGenerated || [];

    // Debug logging
    console.log('🔍 Debug - Loaded competitor ads:', this.competitorAds.length);
    console.log('🔍 Debug - Loaded generated ads:', this.generatedAds.length);

    // Initialize image loading states
    this.initializeImageLoadingStates();

    // If we have competitor ads but no generated ads, user might be waiting for generation
    if (this.competitorAds.length > 0 && this.generatedAds.length === 0) {
      this.generationStatus = 'generating';
    }
  }

  private checkForOngoingGeneration(): void {
    // Check if there's an ongoing generation job stored in service
    const jobId = this.adDataService.getCurrentJobId();
    if (jobId) {
      this.currentJobId = jobId;
      this.startPollingForGeneratedAds(jobId);
    } else {
      // Legacy support: watch for delayed updates
      this.setupLegacyUpdates();
    }
  }

  private setupLegacyUpdates(): void {
    setTimeout(() => {
      const checkUpdates = () => {
        const newCompetitors = this.adDataService.getCompetitorAds();
        const newGenerated = this.adDataService.getGeneratedAds();

        if (this.loadingCompetitorAds && newCompetitors && newCompetitors.length > 0) {
          this.competitorAds = newCompetitors;
          this.loadingCompetitorAds = false;
          this.initializeImageLoadingStates();
        }

        if (this.loadingGeneratedAds && newGenerated && newGenerated.length > 0) {
          this.generatedAds = newGenerated;
          this.loadingGeneratedAds = false;
          this.generationStatus = 'completed';
          this.initializeImageLoadingStates();
          
          console.log('🔍 Debug - Updated generated ads:', this.generatedAds.length);
        }

        if (this.loadingCompetitorAds || this.loadingGeneratedAds) {
          setTimeout(checkUpdates, 1000);
        }
      };

      checkUpdates();
    }, 500);
  }

  /**
   * Start polling for generated ads using the job ID
   */
  private startPollingForGeneratedAds(jobId: string): void {
    console.log('🔄 Starting to poll for generated ads with job ID:', jobId);
    
    this.generationStatus = 'generating';
    this.loadingGeneratedAds = true;

    // Poll every 3 seconds for up to 5 minutes
    this.statusPollingSubscription = interval(3000).pipe(
      switchMap(() => this.checkGenerationStatus(jobId)),
      takeWhile((response: any) => {
        if (!response) return false;
        
        // Update progress
        this.generationProgress = Math.min((response.count / 4) * 100, 100);
        
        // Continue polling if not completed
        return response.status !== 'completed' && response.status !== 'error';
      }, true) // inclusive - emit the final value too
    ).subscribe({
      next: (response: any) => {
        if (response && response.success) {
          this.handleGenerationStatusUpdate(response);
        }
      },
      error: (error) => {
        console.error('❌ Error polling generation status:', error);
        this.generationStatus = 'error';
        this.loadingGeneratedAds = false;
      },
      complete: () => {
        console.log('✅ Polling completed');
        if (this.generationStatus === 'generating') {
          this.generationStatus = 'completed';
        }
      }
    });
  }

  /**
   * Check generation status via API
   */
  private checkGenerationStatus(jobId: string): Promise<any> {
    return this.http.get(`/api/generate-inspired-ads/generation-status/${jobId}`)
      .toPromise()
      .catch(error => {
        console.error('Error checking generation status:', error);
        return null;
      });
  }

  /**
   * Handle generation status updates
   */
  private handleGenerationStatusUpdate(response: any): void {
  console.log('📊 Generation status update:', response);

  if (response.generatedAds && response.generatedAds.length > 0) {
    this.generatedAds = response.generatedAds;

    // ✅ FIXED: Initialize genImageLoaded using INDEX as key (consistent with template)
    for (let i = 0; i < this.generatedAds.length; i++) {
      if (this.genImageLoaded[i] === undefined) {
        this.genImageLoaded[i] = false;
      }
    }

    this.adDataService.setGeneratedAds(this.generatedAds);
  }

  if (response.status === 'completed') {
    this.generationStatus = 'completed';
    this.loadingGeneratedAds = false;
    this.generationProgress = 100;
    this.currentJobId = null;
    this.adDataService.clearCurrentJobId();
    console.log('🎉 Generation completed! Total ads:', this.generatedAds.length);
  }
}
/**
 * Debug method to check image data - ADD THIS METHOD
 */
checkImageData(): void {
  console.log('🔍 Debugging image data:');
  console.log('Generated ads count:', this.generatedAds.length);
  
  this.generatedAds.forEach((ad, index) => {
    console.log(`Ad ${index}:`, {
      hasImageBase64: !!ad.imageBase64,
      imageBase64Length: ad.imageBase64?.length || 0,
      imageBase64Preview: ad.imageBase64?.substring(0, 50) + '...',
      caption: ad.caption?.substring(0, 30) + '...',
      loadingState: this.genImageLoaded[index]
    });
  });
}


  /**
   * Trigger regeneration (for when user wants to generate new ads)
   */
  async regenerateAds(): Promise<void> {
    if (!this.competitorAds.length) {
      alert('No competitor data available for regeneration');
      return;
    }

    // Reset generation state
    this.generatedAds = [];
    this.generationStatus = 'generating';
    this.loadingGeneratedAds = true;
    this.generationProgress = 0;

    try {
      // Get the original search parameters (you might need to store these in the service)
      const searchParams = this.adDataService.getLastSearchParams();
      
      if (!searchParams) {
        alert('Original search parameters not found. Please perform a new search.');
        return;
      }

      // Call the API again
      const response = await this.http.post('/api/generate-inspired-ads/get', searchParams).toPromise();
      
      if (response && (response as any).jobId) {
        this.currentJobId = (response as any).jobId;
        if (this.currentJobId) {
          this.adDataService.setCurrentJobId(this.currentJobId);
          this.startPollingForGeneratedAds(this.currentJobId);
        }
      }

    } catch (error) {
      console.error('❌ Error regenerating ads:', error);
      this.generationStatus = 'error';
      this.loadingGeneratedAds = false;
      alert('Failed to regenerate ads. Please try again.');
    }
  }

  private initializeImageLoadingStates(): void {
  // Initialize competitor ads image loading states
  this.competitorAds.forEach(ad => {
    if (ad.id && this.imageLoaded[ad.id] === undefined) {
      this.imageLoaded[ad.id] = false;
    }
  });

  // ✅ FIXED: Initialize generated ads using INDEX as key
  this.generatedAds.forEach((ad, index) => {
    if (this.genImageLoaded[index] === undefined) {
      this.genImageLoaded[index] = false;
    }
  });
}

  handleImageLoad(identifier: string, type: 'competitor' | 'generated'): void {
  if (type === 'competitor') {
    this.imageLoaded[identifier] = true;
  } else {
    // ✅ FIXED: Convert string identifier to number for generated ads
    const index = parseInt(identifier, 10);
    this.genImageLoaded[index] = true;
    console.log(`✅ Generated image ${index} loaded successfully`);
  }
}

  /**
   * Download all generated ads as a ZIP file with improved error handling
   */
  async downloadAllAds(): Promise<void> {
    console.log('🚀 Starting download all ads...');
    console.log('📊 Generated ads count:', this.generatedAds.length);
    
    if (this.generatedAds.length === 0) {
      alert('No generated ads to download');
      return;
    }

    this.downloadingZip = true;
    
    try {
      // Check if JSZip is available
      if (typeof JSZip === 'undefined') {
        throw new Error('JSZip library is not loaded');
      }

      const zip = new JSZip();
      const adsFolder = zip.folder('generated-ads');
      
      console.log('📁 Created zip folder, processing ads...');
      
      // Add each ad to the zip
      for (let i = 0; i < this.generatedAds.length; i++) {
        const ad = this.generatedAds[i];
        const adNumber = i + 1;
        
        console.log(`📸 Processing ad ${adNumber}/${this.generatedAds.length}`);
        
        try {
          // Validate that imageBase64 exists and is valid
          if (!ad.imageBase64) {
            console.warn(`⚠️ Ad ${adNumber} has no imageBase64 data`);
            continue;
          }

          // Add image file with better error handling
          const imageData = this.base64ToBlob(ad.imageBase64, 'image/png');
          if (imageData.size === 0) {
            console.warn(`⚠️ Ad ${adNumber} produced empty image data`);
            continue;
          }
          
          adsFolder.file(`ad-${adNumber}-image.png`, imageData);
          console.log(`✅ Added image for ad ${adNumber} (${imageData.size} bytes)`);
          
          // Add caption file
          const caption = ad.caption || `Generated ad ${adNumber}`;
          adsFolder.file(`ad-${adNumber}-caption.txt`, caption);
          
          // Add combined info file
          const adInfo = {
            adNumber: adNumber,
            caption: caption,
            imagePrompt: ad.imagePrompt || 'No prompt available',
            imageFile: `ad-${adNumber}-image.png`,
            generatedBy: 'AdVisory AI',
            timestamp: new Date().toISOString(),
            businessName: ad.businessName || 'Unknown',
            campaignName: ad.campaignName || 'Unknown',
            campaignFocus: ad.campaignFocus || 'Unknown',
            keyword: ad.keyword || 'Unknown'
          };
          adsFolder.file(`ad-${adNumber}-info.json`, JSON.stringify(adInfo, null, 2));
          
        } catch (adError) {
          console.error(`❌ Error processing ad ${adNumber}:`, adError);
          // Continue with other ads even if one fails
        }
      }
      
      // Add a summary file
      const summary = {
        totalAds: this.generatedAds.length,
        downloadDate: new Date().toISOString(),
        generatedBy: 'AdVisory AI - Competitor Intelligence',
        contents: this.generatedAds.map((ad, index) => ({
          adNumber: index + 1,
          preview: (ad.caption || 'No caption').substring(0, 100) + ((ad.caption || '').length > 100 ? '...' : ''),
          files: [`ad-${index + 1}-image.png`, `ad-${index + 1}-caption.txt`, `ad-${index + 1}-info.json`]
        }))
      };
      zip.file('README.json', JSON.stringify(summary, null, 2));
      
      console.log('📦 Generating zip file...');
      
      // Generate and download the zip
      const content = await zip.generateAsync({ 
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: {
          level: 6
        }
      });
      
      console.log('💾 Generated zip file, size:', content.size, 'bytes');
      
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `generated-ads-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Download completed successfully');
      
    } catch (error) {
      console.error('❌ Error creating zip file:', error);
      const errorMessage = (error && typeof error === 'object' && 'message' in error) ? (error as any).message : 'Unknown error';
      alert(`Failed to create download: ${errorMessage}. Please check console for details.`);
    } finally {
      this.downloadingZip = false;
    }
  }

  /**
   * Navigate to edit all ads
   */
  editAllAds(): void {
    // Store ads data in service for editing
    this.adDataService.setAdsForEditing(this.generatedAds);
    
    // Navigate to edit page
    this.router.navigate(['/edit-ads'], { 
      queryParams: { mode: 'bulk' }
    });
  }

  /**
   * Navigate to edit a single ad
   */
  editSingleAd(ad: any, index: number): void {
    // Store single ad data in service for editing
    this.adDataService.setAdsForEditing([ad]);
    
    // Navigate to edit page with single ad mode
    this.router.navigate(['/edit-ads'], { 
      queryParams: { 
        mode: 'single', 
        index: index,
        adId: (ad.caption || 'no-caption').substring(0, 20)
      }
    });
  }

  /**
   * Get generation status display text
   */
  getGenerationStatusText(): string {
    switch (this.generationStatus) {
      case 'idle':
        return 'Ready to generate';
      case 'generating':
        return `Generating ads... ${Math.round(this.generationProgress)}%`;
      case 'completed':
        return 'Generation completed';
      case 'error':
        return 'Generation failed';
      default:
        return 'Unknown status';
    }
  }

  /**
   * Check if generation is in progress
   */
  isGenerating(): boolean {
    return this.generationStatus === 'generating';
  }

  /**
   * Check if generation is completed
   */
  isGenerationCompleted(): boolean {
    return this.generationStatus === 'completed';
  }

  /**
   * Improved utility function to convert base64 to blob with error handling
   */
  private base64ToBlob(base64: string, mimeType: string): Blob {
    try {
      // Remove any data URL prefix if present
      const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, '');
      
      // Validate base64 string
      if (!cleanBase64 || cleanBase64.length === 0) {
        throw new Error('Empty base64 string');
      }

      const byteCharacters = atob(cleanBase64);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      
      console.log('🖼️ Created blob:', blob.size, 'bytes');
      return blob;
      
    } catch (error) {
      console.error('❌ Error converting base64 to blob:', error);
      // Return empty blob as fallback
      return new Blob([], { type: mimeType });
    }
  }

  objectEntries(obj: any): [string, any][] {
    return Object.entries(obj || {});
  }
  

  getSocialPlatformIcon(platform: string): string {
    const icons: { [key: string]: string } = {
      'instagram': 'bi bi-instagram',
      'facebook': 'bi bi-facebook',
      'linkedin': 'bi bi-linkedin',
      'twitter': 'bi bi-twitter',
      'youtube': 'bi bi-youtube'
    };
    return icons[platform] || 'bi bi-link-45deg';
  }
  // Add these helper methods to your component class

/**
 * Get properly formatted image source
 */
getImageSrc(imageBase64: string): string {
  if (!imageBase64) {
    console.warn('⚠️ No image data provided');
    return 'data:image/png;base64,'; // Empty data URL
  }
  
  // Check if it already has data URL prefix
  if (imageBase64.startsWith('data:')) {
    return imageBase64;
  }
  
  // Add data URL prefix if missing
  return `data:image/png;base64,${imageBase64}`;
}

/**
 * Handle image loading errors
 */
handleImageError(index: number, ad: any): void {
  console.error(`❌ Failed to load generated image ${index}:`, {
    hasImageBase64: !!ad.imageBase64,
    imageBase64Length: ad.imageBase64?.length || 0,
    imageBase64Preview: ad.imageBase64?.substring(0, 100) + '...'
  });
  
  // Mark as loaded to hide spinner even on error
  this.genImageLoaded[index] = true;
}

/**
 * Debug method to call from browser console
 */
debugImages(): void {
  console.log('🔍 Generated Ads Debug Info:');
  console.log('Total ads:', this.generatedAds.length);
  console.log('Loading states:', this.genImageLoaded);
  
  this.generatedAds.forEach((ad, index) => {
    console.log(`\n📸 Ad ${index + 1}:`, {
      caption: ad.caption?.substring(0, 50) + '...',
      hasImageBase64: !!ad.imageBase64,
      imageBase64Length: ad.imageBase64?.length || 0,
      imageStartsWith: ad.imageBase64?.substring(0, 20),
      isLoaded: this.genImageLoaded[index],
      imageUrl: this.getImageSrc(ad.imageBase64)
    });
    
    // Test if the base64 is valid
    if (ad.imageBase64) {
  try {
    const binaryString = atob(ad.imageBase64.replace(/^data:image\/\w+;base64,/, ''));
    console.log(`✅ Base64 is valid, decoded length: ${binaryString.length}`);
  } catch (e) {
    console.error(`❌ Invalid base64 for ad ${index + 1}:`, (e as Error).message);
  }
}
  });
}

}