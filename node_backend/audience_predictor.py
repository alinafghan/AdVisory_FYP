from flask import Flask, request, jsonify
from PIL import Image
from io import BytesIO
import base64
import os
import torch
import io  # Add missing import
from transformers import BlipProcessor, BlipForConditionalGeneration
import matplotlib.pyplot as plt  # Import for potential visualization (if needed)
from gradcam_clip import CLIPGradCAMVisualizer
from open_clip import create_model_and_transforms, tokenize

# Add these imports for trend extraction (install clip-interrogator if needed)
try:
    from clip_interrogator import Config, Interrogator
    CLIP_INTERROGATOR_AVAILABLE = True
except ImportError:
    print("Warning: clip-interrogator not available. Trend extraction will be disabled.")
    CLIP_INTERROGATOR_AVAILABLE = False

app = Flask(__name__)

def pil_to_base64(img):
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode("utf-8")

class SmartAudiencePredictor:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.gradcam = CLIPGradCAMVisualizer()
        self.blip_processor = BlipProcessor.from_pretrained(
            "Salesforce/blip-image-captioning-base"
        )
        self.blip_model = BlipForConditionalGeneration.from_pretrained(
            "Salesforce/blip-image-captioning-base"
        ).to(self.device)
        self.model, _, self.preprocess = create_model_and_transforms("ViT-B-32", pretrained="openai")
        self.model.to(self.device).eval()
        
        # Initialize clip interrogator if available
        if CLIP_INTERROGATOR_AVAILABLE:
            try:
                self.ci_config = Config()
                self.interrogator = Interrogator(self.ci_config)
            except Exception as e:
                print(f"Failed to initialize clip interrogator: {e}")
                self.interrogator = None
        else:
            self.interrogator = None
            
        self.age_groups = ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"]
        self.gender_groups = ["male", "female", "diverse"]
        self.income_levels = [
            "lower income",
            "middle income",
            "upper middle income",
            "high income",
        ]
        self.profession_categories = [
            "healthcare",
            "technology",
            "education",
            "business",
            "arts",
            "engineering",
            "service industry",
            "retail",
            "finance",
            "marketing",
            "manufacturing",
            "construction",
            "agriculture",
            "entertainment",
        ]
        self.lifestyle_interests = [
            "fitness",
            "travel",
            "luxury",
            "budget-conscious",
            "eco-friendly",
            "family-oriented",
            "tech-savvy",
            "outdoor activities",
            "fashion",
            "gaming",
            "sports",
            "culinary",
            "home improvement",
            "social activism",
        ]
        self.visual_style = [
            "minimalist",
            "colorful",
            "corporate",
            "casual",
            "luxury",
            "vintage",
            "modern",
            "traditional",
            "youthful",
            "sophisticated",
            "urban",
            "rural",
            "technical",
            "artistic",
            "natural",
        ]

    def get_caption(self, image):
        inputs = self.blip_processor(images=image, return_tensors="pt").to(self.device)
        with torch.no_grad():
            out = self.blip_model.generate(**inputs)
        return self.blip_processor.decode(out[0], skip_special_tokens=True)
    
    def get_trends(self, image):
        """Extract trends using clip-interrogator if available"""
        if not self.interrogator:
            print("Trend extraction not available - using fallback")
            return self._get_fallback_trends(image)
        
        try:
            trend_str = self.interrogator.interrogate_classic(image)
            return trend_str.split(", ")[:5]
        except Exception as e:
            print(f"Trend extraction failed: {e}")
            return self._get_fallback_trends(image)
    
    def _get_fallback_trends(self, image):
        """Fallback trend extraction using basic image analysis"""
        # Simple fallback based on image properties
        try:
            # Convert to RGB if not already
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Basic color analysis
            colors = image.getcolors(maxcolors=256*256*256)
            if colors:
                # Sort by frequency
                colors.sort(key=lambda x: x[0], reverse=True)
                dominant_color = colors[0][1]
                
                # Map colors to trends (very basic)
                r, g, b = dominant_color
                trends = []
                
                if r > 200 and g < 100 and b < 100:
                    trends.append("bold")
                elif g > 200 and r < 100 and b < 100:
                    trends.append("natural")
                elif b > 200 and r < 100 and g < 100:
                    trends.append("cool")
                elif r > 180 and g > 180 and b > 180:
                    trends.append("minimalist")
                elif r < 100 and g < 100 and b < 100:
                    trends.append("dark")
                else:
                    trends.append("colorful")
                
                return trends
            
            return ["modern", "clean"]
        except Exception as e:
            print(f"Fallback trend extraction failed: {e}")
            return ["contemporary"]

    def map_trend_tags_to_themes(self, trends):
        themes = {
            "Gen Z aesthetic": [
                "vaporwave",
                "neon",
                "influencer",
                "TikTok",
                "streetwear",
                "dopamine",
                "bold",
                "colorful"
            ],
            "luxury minimalism": [
                "clean",
                "minimalist",
                "studio lighting",
                "white background",
                "modern",
            ],
            "eco-conscious": ["natural", "plant", "organic", "outdoor", "greenery"],
            "high fashion": ["editorial", "runway", "couture", "fashion magazine"],
            "corporate": ["dark", "professional", "business", "formal"],
        }
        matched = []
        for theme, keywords in themes.items():
            if any(keyword.lower() in trend.lower() for trend in trends for keyword in keywords):
                matched.append(theme)
        return matched if matched else ["contemporary"]

    def detect_domain(self, text):
        if any(
            word in text.lower()
            for word in ["sanitizer", "germ", "hygiene", "clean", "bacteria"]
        ):
            return "health"
        elif any(word in text.lower() for word in ["serum", "makeup", "beauty", "skincare"]):
            return "beauty"
        elif any(word in text.lower() for word in ["fashion", "clothing", "style"]):
            return "fashion"
        elif any(word in text.lower() for word in ["tech", "device", "laptop", "app"]):
            return "technology"
        return "general"

    def encode_image(self, image):
        image_input = self.preprocess(image).unsqueeze(0).to(self.device)
        with torch.no_grad():
            return self.model.encode_image(image_input)

    def predict_match(self, image_features, categories, prompt_template):
        prompts = [prompt_template.format(category=cat) for cat in categories]
        tokens = tokenize(prompts).to(self.device)
        with torch.no_grad():
            text_features = self.model.encode_text(tokens)

        image_features /= image_features.norm(dim=-1, keepdim=True)
        text_features /= text_features.norm(dim=-1, keepdim=True)
        similarity = (100.0 * image_features @ text_features.T).softmax(dim=-1)
        return {categories[i]: similarity[0][i].item() for i in range(len(categories))}

    def generate_report(self, image, generate_xai=False):
        try:
            caption = self.get_caption(image)
            trends = self.get_trends(image)
            trend_text = ", ".join(trends) if trends else "modern"
            mapped_themes = self.map_trend_tags_to_themes(trends)
            theme_text = ", ".join(mapped_themes) if mapped_themes else "contemporary"

            domain = self.detect_domain(caption + " " + trend_text + " " + theme_text)
            image_features = self.encode_image(image)

            prompt = lambda cat: self.predict_match(
                image_features,
                cat,
                prompt_template=f"an advertisement in the {domain} domain with elements of {trend_text} and themes like {theme_text} targeting a {{category}} audience",
            )

            scores = {
                "age": prompt(self.age_groups),
                "gender": prompt(self.gender_groups),
                "income": prompt(self.income_levels),
                "profession": prompt(self.profession_categories),
                "interests": prompt(self.lifestyle_interests),
                "visual_style": prompt(self.visual_style),
            }

            top = lambda cat: sorted(scores[cat].items(), key=lambda x: x[1], reverse=True)[0][0]
            persona = f"{top('age')} {top('gender')}, {top('income')} in {top('profession')}, interested in {top('interests')}"
            top_label = max(scores["profession"], key=scores["profession"].get)

            report = {
                "summary": {
                    "caption": caption,
                    "trends": trends,
                    "themes": mapped_themes,
                    "domain": domain,
                    "primary_persona": persona,
                    "visual_style": top("visual_style"),
                },
                "demographics": scores
            }

            if generate_xai:
                explanation_img_b64 = self.gradcam.generate_heatmap(
                    image,
                    text=f"an advertisement targeting {top_label} professionals"
                )
                report["xai"] = {
                    "heatmap": explanation_img_b64
                }

            return report
        except Exception as e:
            print(f"Error in generate_report: {e}")
            raise