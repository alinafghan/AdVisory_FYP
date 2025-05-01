export interface AudienceReport {
    summary: {
      primary_persona: string;
      visual_style: string;
      content_type: string;
    };
    detailed_demographics: any; // Replace 'any' with more specific types
    content_analysis: any;     // Replace 'any' with more specific types
    image_path: string;
    // ... other properties ...
  }