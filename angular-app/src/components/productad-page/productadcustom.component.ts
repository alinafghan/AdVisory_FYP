import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MrrComponent } from './mrr.component';
import { HttpClient } from '@angular/common/http'; 
import { AdDataService } from "../../services/ad-data.service";

@Component({
  selector: 'app-productadcustom-page',
  standalone: true,
  imports: [CommonModule, FormsModule, MrrComponent],
  templateUrl: './productadcustom.component.html',
  styleUrls: ['./productadcustom.css']
})
export class ProductAdCustomComponent implements OnInit, AfterViewInit {
  @ViewChild(MrrComponent) mrrComponent!: MrrComponent;
  
  productImage: string | null = null;
  selectedBackground: string = '';
  backgrounds: string[] = ['assets/images/1.png', 'assets/images/2.png', 'assets/images/3.png','assets/images/5.png','assets/images/6.png'];
  customMode = false;
  
customStyle: string = '';
customLighting: string = '';
  customPrompt = '';
  customExclude = '';
  
  //save prompt for when saving it to adservice
  latestUsedPrompt: string = 'custom';

  //for spinner while generating background
  isGenerating: boolean = false;



  // Display dimensions (what's shown on the screen)
  displayWidth: number = 460;
  displayHeight: number = 460;
  
  // Actual output dimensions (used for download)
  outputWidth: number = 1080;
  outputHeight: number = 1080;
  
  // Aspect Ratio Settings
  aspectRatio: string = '1:1'; // Default to Post
  customWidth: number = 1080;
  customHeight: number = 1080;
  // Component properties
selectedDimension: string = 'square';
customDimension: boolean = false;
customGenerateWidth: number | null = null;
customGenerateHeight: number | null = null;

//make it your own
promptMode = false;
selectedPrompt = '';
selectedPromptBackground = '';
imagePrompts: { [key: string]: string } = {
  'assets/images/2.png': 'light beige wooden plinth resting centrally , white background, green leaves on the outer edges, natural bright lighting, product shoot',
  'assets/images/3.png': "A podium base, painted in a soft pink hue, is the focal point of this minimal scene. The podium occupies approximately 15% of the image height. Its base is adorned with a small, round plate, adding a touch of elegance to the design. Positioned on a pristine white surface, the podium casts a soft shadow on the floor beneath it. The backdrop features a cream-colored wall that contrasts with the podium and the floor. The lighting, seemingly artificial, highlights the podium's base and plate, adding depth and dimension without dominating the scene.",
  'assets/images/5.png': "Close-up shot of a modern kitchen countertop with ample clean white marble surface in the foreground, taking up most of the frame, soft natural lighting from side windows, blurred kitchen elements in the background (sink, cabinets), minimalistic decor, high-end feel, neutral tones, photorealistic, product photography setup, 8k, shallow depth of field focusing on the countertop",
  'assets/images/6.png': "Close-up shot of a modern  empty room floor with wide open clean hardwood or neutral-toned flooring occupying most of the frame, soft natural lighting from large side windows with curtains, minimalistic and spacious aesthetic, , photorealistic, 8k, shallow depth of field focused on the floor area, suitable for  product placement"
}


//for saving generated image to campaign
campaigns: any[] = [];
selectedCampaign: string | null = null;

  constructor(private http: HttpClient, private adDataService: AdDataService) {} 

  ngOnInit() {
    this.productImage = sessionStorage.getItem('uploadedImage'); // Retrieve from session storage
    this.fetchUserCampaigns();
  }

  ngAfterViewInit() {
    if (this.productImage) {
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        
        // Set the initial width and height to maintain aspect ratio
        const initialHeight = 200; // For example
        const initialWidth = initialHeight * aspectRatio;
        
        // Adjust MRR component size
        if (this.mrrComponent) {
          this.mrrComponent.resize(initialWidth, initialHeight);
        }
      };
      img.src = this.productImage;
    }
  }
  
  selectBackground(bg: string) {
    this.selectedBackground = bg;
  }
  

  toggleCustomMode() {
    this.customMode = !this.customMode;
  }
  
  // Aspect Ratio Change Handler
  onAspectRatioChange() {
    switch (this.aspectRatio) {
      case '1:1':
        this.outputWidth = 1080;
        this.outputHeight = 1080;
        this.displayWidth = 390;
        this.displayHeight = 390;
        break;
      case '9:16':
        this.outputWidth = 1080;
        this.outputHeight = 1920;
        // Scale the display height proportionally while keeping display width fixed at 460
        this.displayWidth = 290;
        this.displayHeight = 290 * (16/9);
        break;
      case 'Custom':
        this.applyCustomDimensions();
        break;
    }
  }

  // Apply Custom Dimensions
  applyCustomDimensions() {
    this.outputWidth = this.customWidth;
    this.outputHeight = this.customHeight;
    
    // Set display dimensions proportionally based on a maximum width of 460px
    const aspectRatio = this.customWidth / this.customHeight;
    if (aspectRatio >= 1) {
      // Wider than tall, constrain width to 460
      this.displayWidth = 460;
      this.displayHeight = 460 / aspectRatio;
    } else {
      // Taller than wide, constrain height to 460
      this.displayHeight = 460;
      this.displayWidth = 460 * aspectRatio;
    }
  }

  downloadAd() {
    if (!this.selectedBackground || !this.productImage) {
      alert('Please select both a background image and a product image');
      return;
    }
  
    // Create a temporary canvas for the composition
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      alert('Unable to create canvas context');
      return;
    }

    // First, get the background image
    const bgImg = new Image();
    bgImg.crossOrigin = 'anonymous';
    bgImg.onload = () => {
      // Set canvas size based on the output dimensions for the selected aspect ratio
      canvas.width = this.outputWidth;
      canvas.height = this.outputHeight;
      
      // Draw background on canvas, scaling it to match canvas dimensions
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
      
      if (!this.mrrComponent) {
        alert('Error: Could not access product image component');
        return;
      }
      
      // Get the background image element
      const backgroundImgElement = document.querySelector('.relative.mt-4.border.p-4 img') as HTMLImageElement;
      if (!backgroundImgElement) {
        alert('Error: Could not find background image element');
        return;
      }
      
      // Get the displayed background dimensions
      const bgDisplayedWidth = backgroundImgElement.clientWidth;
      const bgDisplayedHeight = backgroundImgElement.clientHeight;
      
      // Calculate scale factors between displayed and output dimensions
      const scaleX = this.outputWidth / bgDisplayedWidth;
      const scaleY = this.outputHeight / bgDisplayedHeight;
      
      // Load product image
      const productImg = new Image();
      productImg.crossOrigin = 'anonymous';
      productImg.onload = () => {
        // Get the MRR wrapper element
        const boxWrapper = this.mrrComponent.boxWrapper;
        const boxElement = this.mrrComponent.box;
        
        // Get the position of the background image in the document
        const bgRect = backgroundImgElement.getBoundingClientRect();
        const boxRect = boxWrapper.getBoundingClientRect();
        
        // Calculate position relative to the background image
        const relativeLeft = boxRect.left - bgRect.left;
        const relativeTop = boxRect.top - bgRect.top;
        
        // Scale to the output image dimensions
        const scaledLeft = relativeLeft * scaleX;
        const scaledTop = relativeTop * scaleY;
        
        // Get width and height of the box
        const scaledWidth = boxElement.offsetWidth * scaleX;
        const scaledHeight = boxElement.offsetHeight * scaleY;
        
        // Get rotation from MRR component
        const rotation = this.mrrComponent.getCurrentRotation(boxWrapper);
        
        // Calculate center point for rotation
        const centerX = scaledLeft + (scaledWidth / 2);
        const centerY = scaledTop + (scaledHeight / 2);
        
        // Save current state
        ctx.save();
        
        // Apply transformations
        ctx.translate(centerX, centerY);
        ctx.rotate(rotation * Math.PI / 180);
        
        // Draw the product image centered at the rotation point
        ctx.drawImage(
          productImg,
          -scaledWidth / 2,
          -scaledHeight / 2,
          scaledWidth,
          scaledHeight
        );
        
        // Restore canvas state
        ctx.restore();
        
        // Convert to data URL and trigger download
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'custom-ad.png';
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
      
      // Set the product image source to start loading
      productImg.src = this.productImage || '';
    };
    
    // Set background image source to start loading
    bgImg.src = this.selectedBackground;
  }
  // Method to handle dimension selection change
onDimensionChange() {
  this.customDimension = this.selectedDimension === 'custom';
}
  
// make it your own option
makeItYourOwn(bg: string, event: MouseEvent) {
  event.stopPropagation(); // Prevent background selection
  this.promptMode = true;
  this.selectedPromptBackground = bg;
  this.selectedPrompt = this.imagePrompts[bg] || '';
}

generateCustomBackground() {
  this.isGenerating = true; // Start spinner

  let width: number;
  let height: number;
  let prompt = '';
  let negativePrompt = '';

  if (this.promptMode) {
    prompt = this.selectedPrompt || this.imagePrompts[this.selectedBackground] || '';
  } else if (this.customMode) {
    prompt = `${this.customPrompt}, ${this.customStyle}, ${this.customLighting}`;
    negativePrompt = this.customExclude;
  }

  if (this.selectedDimension === 'square') {
    width = 1080;
    height = 1080;
  } else if (this.selectedDimension === 'vertical') {
    width = 720;
    height = 1280;
  } else if (this.selectedDimension === 'custom') {
    if (this.customWidth && this.customHeight) {
      width = this.customWidth;
      height = this.customHeight;
    } else {
      console.error('Custom dimensions are not set!');
      this.isGenerating = false;
      return;
    }
  } else {
    width = 512;
    height = 512;
  }

  console.log('Prompt:', prompt);
  console.log('Negative Prompt:', negativePrompt);
  console.log('Dimensions:', width, 'x', height);

  this.latestUsedPrompt = prompt;

  const requestData = {
    prompt: prompt,
    negative_prompt: negativePrompt,
    width: width,
    height: height,
  };

  this.http.post<any>('http://localhost:5000/generate', requestData).subscribe(
    response => {
      if (response.images && response.images.length > 0) {
        this.selectedBackground = `data:image/png;base64,${response.images[0]}`;
      }
      this.isGenerating = false;
      this.customMode = false; // move here!
    },
    error => {
      console.error('Error generating image:', error);
      this.isGenerating = false;
      this.customMode = false; // move here too!
    }
  );
  

  this.customMode = false;
}

// fetch campaigns for a user
fetchUserCampaigns() {
  //const userId = sessionStorage.getItem('businessId'); // assuming you saved userId during login
  //if (!userId) return;

  this.http.get<any[]>(`http://localhost:3000/ads/getAllCampaigns`).subscribe(
    (data) => {
      console.log('Campaigns fetched:', data);
      this.campaigns = data;
    },
    (err) => console.error('Failed to load campaigns', err)
  );
  
}

submitComposedImageToCampaign() {
  if (!this.selectedBackground || !this.productImage) {
    alert('Please select both a background image and a product image');
    return;
  }

  if (!this.selectedCampaign) {
    alert('Please select a campaign first.');
    return;
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    alert('Unable to create canvas context');
    return;
  }

  const bgImg = new Image();
  bgImg.crossOrigin = 'anonymous';
  bgImg.onload = () => {
    canvas.width = this.outputWidth;
    canvas.height = this.outputHeight;

    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    if (!this.mrrComponent) {
      alert('Error: Could not access product image component');
      return;
    }

    const backgroundImgElement = document.querySelector('.relative.mt-4.border.p-4 img') as HTMLImageElement;
    if (!backgroundImgElement) {
      alert('Error: Could not find background image element');
      return;
    }

    const bgDisplayedWidth = backgroundImgElement.clientWidth;
    const bgDisplayedHeight = backgroundImgElement.clientHeight;

    const scaleX = this.outputWidth / bgDisplayedWidth;
    const scaleY = this.outputHeight / bgDisplayedHeight;

    const productImg = new Image();
    productImg.crossOrigin = 'anonymous';
    productImg.onload = () => {
      const boxWrapper = this.mrrComponent.boxWrapper;
      const boxElement = this.mrrComponent.box;

      const bgRect = backgroundImgElement.getBoundingClientRect();
      const boxRect = boxWrapper.getBoundingClientRect();

      const relativeLeft = boxRect.left - bgRect.left;
      const relativeTop = boxRect.top - bgRect.top;

      const scaledLeft = relativeLeft * scaleX;
      const scaledTop = relativeTop * scaleY;

      const scaledWidth = boxElement.offsetWidth * scaleX;
      const scaledHeight = boxElement.offsetHeight * scaleY;

      const rotation = this.mrrComponent.getCurrentRotation(boxWrapper);
      const centerX = scaledLeft + (scaledWidth / 2);
      const centerY = scaledTop + (scaledHeight / 2);

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation * Math.PI / 180);

      ctx.drawImage(
        productImg,
        -scaledWidth / 2,
        -scaledHeight / 2,
        scaledWidth,
        scaledHeight
      );

      ctx.restore();

      const dataUrl = canvas.toDataURL('image/png');

      
      const postData = {
        campaignId: this.selectedCampaign,
        prompt: this.latestUsedPrompt,
        width: this.outputWidth,
        height: this.outputHeight,
        imageData: dataUrl
      };

      this.http.post('http://localhost:3000/adImages/add', postData).subscribe(
        (response: any) => {
          console.log('Upload successful', response);
          alert('Image successfully added to campaign!');

          // ✅ Store adImageId in adDataService if present
          const adImageId = response?.adImage?.id;
          if (adImageId) {
            this.adDataService.setAdImageId(adImageId);
            console.log('Stored adImageId in service:', adImageId);
          } else {
            console.warn('No adImageId received in response.');
          }

        },
        (error: any) => {
          console.error('Error uploading image', error);
          alert('Failed to add image to campaign');
        }
      );
    };

    productImg.src = this.productImage || '';
  };

  bgImg.src = this.selectedBackground;
}

}