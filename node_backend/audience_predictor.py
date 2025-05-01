import torch
import clip
from PIL import Image
import numpy as np
import os
import pandas as pd
import matplotlib.pyplot as plt
from typing import Dict, List, Tuple

class AudiencePredictor:
    def __init__(self):
        """Initialize the CLIP model for audience prediction."""
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Using device: {self.device}")
        self.model, self.preprocess = clip.load("ViT-B/32", device=self.device)

        # Define demographic categories for prediction
        self.age_groups = ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"]
        self.gender_groups = ["male", "female", "diverse"]
        self.income_levels = ["lower income", "middle income", "upper middle income", "high income"]
        self.education_levels = ["high school", "college", "graduate degree", "professional degree"]
        self.profession_categories = [
            "healthcare", "technology", "education", "business", "arts",
            "engineering", "service industry", "retail", "finance", "marketing",
            "manufacturing", "construction", "agriculture", "entertainment"
        ]
        self.lifestyle_interests = [
            "fitness", "travel", "luxury", "budget-conscious", "eco-friendly",
            "family-oriented", "tech-savvy", "outdoor activities", "fashion",
            "gaming", "sports", "culinary", "home improvement", "social activism"
        ]

        # Visual style descriptors to help with audience matching
        self.visual_style = [
            "minimalist", "colorful", "corporate", "casual", "luxury",
            "vintage", "modern", "traditional", "youthful", "sophisticated",
            "urban", "rural", "technical", "artistic", "natural"
        ]

    def encode_image(self, image_path: str) -> torch.Tensor:
        """Encode an image using CLIP."""
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found at {image_path}")

        image = Image.open(image_path).convert("RGB")
        image_input = self.preprocess(image).unsqueeze(0).to(self.device)
        with torch.no_grad():
            image_features = self.model.encode_image(image_input)
        return image_features

    def predict_demographic_match(self, image_features: torch.Tensor, categories: List[str],
                                    prefix: str = "") -> Dict[str, float]:
        """Calculate similarity scores between image and demographic categories."""
        text_inputs = [f"an advertisement for {prefix} {category} audience"
                       for category in categories]

        text_tokens = clip.tokenize(text_inputs).to(self.device)
        with torch.no_grad():
            text_features = self.model.encode_text(text_tokens)

        # Normalize features
        image_features = image_features / image_features.norm(dim=-1, keepdim=True)
        text_features = text_features / text_features.norm(dim=-1, keepdim=True)

        # Calculate similarities
        similarity = (100.0 * image_features @ text_features.T).softmax(dim=-1)

        # Convert to dictionary of scores
        results = {categories[i]: similarity[0][i].item() for i in range(len(categories))}
        return results

    def predict_audience(self, image_path: str) -> Dict[str, Dict[str, float]]:
        """Predict the target audience demographics for an image."""
        image_features = self.encode_image(image_path)

        # Calculate matches for each demographic category
        results = {
            "age": self.predict_demographic_match(image_features, self.age_groups),
            "gender": self.predict_demographic_match(image_features, self.gender_groups),
            "income": self.predict_demographic_match(image_features, self.income_levels),
            "education": self.predict_demographic_match(image_features, self.education_levels),
            "profession": self.predict_demographic_match(image_features, self.profession_categories),
            "interests": self.predict_demographic_match(image_features, self.lifestyle_interests),
            "visual_style": self.predict_demographic_match(image_features, self.visual_style, prefix="")
        }

        return results

    def analyze_image_content(self, image_path: str) -> Dict[str, float]:
        """Analyze the content of the image using descriptive prompts."""
        image_features = self.encode_image(image_path)

        content_prompts = [
            "product showcase", "lifestyle imagery", "people using products",
            "abstract concept", "emotional appeal", "informational content",
            "promotional content", "brand-focused", "value proposition",
            "call to action"
        ]

        text_tokens = clip.tokenize([f"an image with {p}" for p in content_prompts]).to(self.device)
        with torch.no_grad():
            text_features = self.model.encode_text(text_tokens)

        # Normalize features
        image_features = image_features / image_features.norm(dim=-1, keepdim=True)
        text_features = text_features / text_features.norm(dim=-1, keepdim=True)

        # Calculate similarities
        similarity = (100.0 * image_features @ text_features.T).softmax(dim=-1)

        # Convert to dictionary of scores
        results = {content_prompts[i]: similarity[0][i].item() for i in range(len(content_prompts))}
        return results

    def generate_report(self, image_path: str) -> Dict:
        """Generate a comprehensive audience analysis report for an image."""
        demographic_results = self.predict_audience(image_path)
        content_analysis = self.analyze_image_content(image_path)

        # Find top matches for each category
        top_matches = {}
        for category, scores in demographic_results.items():
            sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
            top_matches[category] = sorted_scores[:2]  # Top 2 matches

        # Find top content descriptors
        sorted_content = sorted(content_analysis.items(), key=lambda x: x[1], reverse=True)
        top_content = sorted_content[:3]  # Top 3 content descriptors

        # Calculate audience persona
        primary_age = top_matches["age"][0][0]
        primary_gender = top_matches["gender"][0][0]
        primary_income = top_matches["income"][0][0]
        primary_profession = top_matches["profession"][0][0]
        primary_interest = top_matches["interests"][0][0]

        # Compile the report
        report = {
            "summary": {
                "primary_persona": f"{primary_age} {primary_gender}, {primary_income} in {primary_profession} with interest in {primary_interest}",
                "visual_style": top_matches["visual_style"][0][0],
                "content_type": top_content[0][0]
            },
            "detailed_demographics": demographic_results,
            "content_analysis": content_analysis,
            "image_path": image_path
        }

        return report
    
    def visualize_results(self, report: Dict) -> None:
        """Visualize the audience prediction results."""
        # ... (rest of your visualization code) ...
        pass # Placeholder for brevity in this example

    def save_report(self, report: Dict) -> None:
        """Save the report to a CSV file."""
        # ... (rest of your save report code) ...
        pass # Placeholder for brevity in this example

def format_report_for_display(report: Dict) -> str:
    """Format the report for nice console display."""
    # ... (rest of your format report code) ...
    return "" # Placeholder for brevity
    
def analyze_image(image_path, save_report=False, visualize=True):
    """
    Analyze an image for audience prediction.

    Args:
        image_path (str): Path to the image file
        save_report (bool): Whether to save the report to CSV
        visualize (bool): Whether to display visualization

    Returns:
        dict: The complete audience analysis report
    """
    print(f"Analyzing image: {image_path}")
    analyzer = AudiencePredictor()

    try:
        # Generate the report
        report = analyzer.generate_report(image_path)

        # Display report in console
        print(format_report_for_display(report))

        # Save report if requested
        if save_report:
            analyzer.save_report(report)

        # Visualize if requested
        if visualize:
            fig = analyzer.visualize_results(report)
            plt.show()

        return report

    except Exception as e:
        print(f"Error analyzing image: {e}")
        return None

if __name__ == '__main__':
    # Example usage if you want to run it directly
    image_path = "example_ad_image.jpg" # Replace with an actual image path
    report = analyze_image(image_path, save_report=True, visualize=False)
    if report:
        print("\nAnalysis Report:")
        print(report)