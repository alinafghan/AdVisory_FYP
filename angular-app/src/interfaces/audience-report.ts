export interface XaiData {
  heatmap?: string;
  [key: string]: any; // Keep this if XAI can have other dynamic properties
}

// This interface is needed because 'xai' is nested inside 'analysis'
export interface AnalysisData {
  xai?: XaiData;
  [key: string]: any; // Keep this if 'analysis' can have other dynamic properties besides 'xai'
}

export interface AudienceReport {
  summary?: {
    primary_persona?: string;
    visual_style?: string;
    domain?: string;
    caption?: string;
    trends?: string[];
    themes?: string[];
    content_type?: string;
  };

  // This needs to match the backend's key, which is 'demographics' based on your HTML
  demographics?: {
    [key: string]: {
      [key: string]: number;
    };
  };

  // 'analysis' is now explicitly defined, which resolves the index signature error
  analysis?: AnalysisData;

  // Do not add a top-level index signature here
}
