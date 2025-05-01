export interface AudienceReport {
  summary?: { // Make summary optional in case it's not always present
      primary_persona?: string;
      visual_style?: string;
      domain?: string; // Add the missing properties
      caption?: string;
      trends?: string[];
      themes?: string[];
      content_type?: string; // Added based on one of the errors, ensure it is correct
  };
  detailed_demographics?: { // Make detailed_demographics optional
      [key: string]: { // Use a general index signature
          [key: string]: number;
      };
  };
  [key: string]: any; // Add this index signature to the AudienceReport interface to handle any other properties
}
