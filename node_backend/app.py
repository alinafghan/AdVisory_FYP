import os, base64, xgboost as xgb, numpy as np, requests, pandas as pd, openai, torch, logging, cvxpy as cp
import pandas as pd
import openai
import replicate
import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from transformers import VisionEncoderDecoderModel, ViTImageProcessor, AutoTokenizer, AutoModelForSeq2SeqLM, pipeline
from PIL import Image
from flask import Flask, request, jsonify
from scipy.optimize import curve_fit
import  tempfile, json
from flask import Flask
from flask_cors import CORS
from py_routes import register_blueprints

app = Flask(__name__)
CORS(app)

CACHE_DIR = os.path.join(tempfile.gettempdir(), 'facebook_ad_cache')
os.makedirs(CACHE_DIR, exist_ok=True)
CACHE_METADATA = os.path.join(CACHE_DIR, 'cache_metadata.json')

register_blueprints(app)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)


# app = Flask(__name__)

# logging.basicConfig(
#     level=logging.INFO,
#     format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
# )





# openai.api_key = os.getenv("OPENAI_API_KEY")

# CORS(app)  

# # # Initialize the TrendAnalyzer
# # analyzer = TrendAnalyzer()

# # @app.route('/analyze', methods=['POST'])
# # def analyze_trends():
# #     try:
# #         data = request.get_json()
# #         keywords = data.get('keywords', [])
        
# #         if not keywords:
# #             return jsonify({'error': 'No keywords provided'}), 400
            
# #         # Process pipeline
# #         processed_data = analyzer.fetch_trend_data(keywords)
# #         if not processed_data:
# #             return jsonify({'error': 'Failed to fetch trend data'}), 500
            
# #         models, forecasts = analyzer.train_prediction_models(processed_data)
# #         if not forecasts:
# #             return jsonify({'error': 'Failed to generate forecasts'}), 500
            
# #         insights = analyzer.get_trend_insights(forecasts)
# #         if not insights:
# #             return jsonify({'error': 'Failed to generate insights'}), 500
            
# #         recommendations = analyzer.generate_ad_recommendations(insights)
# #         if not recommendations:
# #             return jsonify({'error': 'Failed to generate recommendations'}), 500
            
# #         return jsonify({
# #             'insights': insights,
# #             'recommendations': recommendations
# #         })
        
# #     except Exception as e:
# #         logger.error(f"Error in analyze_trends: {str(e)}")
# #         return jsonify({'error': str(e)}), 500

# # @app.route('/predictions/<keyword>', methods=['GET'])
# # def get_predictions(keyword):
# #     try:
# #         # Fetch trend data for single keyword
# #         processed_data = analyzer.fetch_trend_data([keyword])
# #         if not processed_data or keyword not in processed_data:
# #             return jsonify({'error': f'No data available for {keyword}'}), 404
            
# #         # Generate predictions
# #         models, forecasts = analyzer.train_prediction_models({keyword: processed_data[keyword]})
# #         if not forecasts or keyword not in forecasts:
# #             return jsonify({'error': 'Failed to generate predictions'}), 500
            
# #         # Extract prediction data
# #         forecast_data = forecasts[keyword][['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(30)
# #         prediction_data = forecast_data.to_dict(orient='records')
        
# #         return jsonify({
# #             'keyword': keyword,
# #             'predictions': prediction_data
# #         })
        
# #     except Exception as e:
# #         logger.error(f"Error in get_predictions: {str(e)}")
# #         return jsonify({'error': str(e)}), 500
    
# # @app.route('/search', methods=['POST'])
# # def search_trends():
# #     try:
# #         data = request.get_json()
# #         query = data.get('query', '').strip().lower()

# #         if not query:
# #             return jsonify({'error': 'Search query is required'}), 400

# #         # Fetch all trends (or use cached data)
# #         all_trends = fetch_all_trends()  # Replace with your logic to fetch all trends

# #         # Filter trends based on the search query
# #         filtered_trends = {
# #             keyword: insight
# #             for keyword, insight in all_trends.items()
# #             if query in keyword.lower()
# #         }

# #         return jsonify({
# #             'insights': filtered_trends,
# #             'recommendations': []  # Add logic to filter recommendations if needed
# #         })

# #     except Exception as e:
# #         return jsonify({'error': str(e)}), 500

# ################################trends end###############################################

# ##################### caption ##############################


# ######################### ENHANCE ################################

# device = "cuda" if torch.cuda.is_available() else "cpu"
# model_checkpoint = "gokaygokay/Flux-Prompt-Enhance"
# tokenizer = AutoTokenizer.from_pretrained(model_checkpoint)
# model = AutoModelForSeq2SeqLM.from_pretrained(model_checkpoint).to(device)

# enhancer = pipeline('text2text-generation',
#                     model=model,
#                     tokenizer=tokenizer,
#                     repetition_penalty=1.2,
#                     device=device)


# @app.route("/")
# def home():
#     return "Flask is running!"

# ######################### EDIT IMAGE #################################

# OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# # Configure upload folder for temporary image files
# UPLOAD_FOLDER = 'uploads'
# if not os.path.exists(UPLOAD_FOLDER):
#     os.makedirs(UPLOAD_FOLDER)
# app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


# @app.route('/enhance', methods=['POST'])
# def enhance_prompt():
#     try:
#         data = request.get_json()
#         if 'prompt' not in data:
#             return jsonify({'error': 'Invalid input. Expected JSON with "prompt" key.'}), 400
        
#         prefix = "enhance prompt: "
#         input_prompt = prefix + data['prompt']
        
#         results = enhancer(input_prompt, max_length=256)
#         enhanced_prompt = results[0]['generated_text']
        
#         return jsonify({'enhanced_prompt': enhanced_prompt})
    
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

# @app.route('/health', methods=['GET'])
# def health_check():
#     return jsonify({"status": "up"}), 200

# ###############################productad##########################################
# api_token = os.getenv("API_TOKEN")
# replicate_client = replicate.Client(api_token)
# REPLICATE_MODEL_URL = "bytedance/sdxl-lightning-4step:6f7a773af6fc3e8de9d5a3c00be77c17308914bf67772726aff83496ba1e3bbe"
# REPLICATE_MODEL = "daanelson/real-esrgan-a100:f94d7ed4a1f7e1ffed0d51e4089e4911609d5eeee5e874ef323d2c7562624bed"


# @app.route('/generate', methods=['POST'])
# def generate_image():
#     # Get data from the frontend (prompt, width, height, etc.)
#     data = request.get_json()

#     # Define the input for the Replicate model
#     input_data = {
#         "prompt": data.get('prompt', ''),
#         "negative_prompt": data.get('negative_prompt', ''),
#         "width": data.get('width', 512),  # Default width
#         "height": data.get('height', 512),  # Default height
#         "num_inference_steps":4,
#         "scheduler":'K_EULER_ANCESTRAL',
#         "guidance_scale":0,
#         "seed":0
#         # You can add more params based on your needs
#     }

#     # Call Replicate API for SDXL Lightning model
#     output = replicate_client.run(
#         REPLICATE_MODEL_URL,
#         input=input_data
#     )

#     # Handle the output if it's a list of file-like objects (binary data)
#     if isinstance(output, list):
#         image_urls = []
#         for item in output:
#             # Read the binary data from the file-like object
#             image_data = item.read()

#             # Convert the image data to a base64-encoded string
#             image_base64 = base64.b64encode(image_data).decode('utf-8')

#             # Add the base64 string to the list of images
#             image_urls.append(image_base64)

#         # Return the list of base64-encoded images
#         return jsonify({'images': image_urls})

#     # Return an error if the output format is unexpected
#     return jsonify({'error': 'Unexpected output format'}), 500


 

# @app.route('/caption-image', methods=['POST'])
# def caption_image():
#     """Send an image to the captioning API and return the result"""
#     try:
#         data = request.get_json()
#         image_path = data.get('image_path')
        
#         if not image_path or not os.path.exists(image_path):
#             return jsonify({'error': 'Valid image path is required'}), 400
        
#         # Call the image captioning API
#         caption = generate_image_caption(image_path)
        
#         # Update the cache metadata with the caption
#         with open(CACHE_METADATA, 'r') as f:
#             cache_data = json.load(f)
        
#         # Find the image in the metadata
#         image_id = None
#         for img_id, img_data in cache_data['images'].items():
#             if img_data['local_path'] == image_path:
#                 image_id = img_id
#                 cache_data['images'][img_id]['caption'] = caption
#                 break
        
#         # Save the updated cache metadata
#         with open(CACHE_METADATA, 'w') as f:
#             json.dump(cache_data, f, indent=2)
        
#         return jsonify({
#             'success': True,
#             'image_id': image_id,
#             'image_path': image_path,
#             'caption': caption
#         })
    
#     except Exception as e:
#         logging.exception("Error while captioning image")
#         return jsonify({'error': str(e)}), 500

# @app.route('/caption-cached-images', methods=['POST'])
# def caption_cached_images():
#     """Caption multiple images from the cache"""
#     try:
#         data = request.get_json()
#         image_paths = data.get('image_paths', [])
        
#         if not image_paths:
#             return jsonify({'error': 'Image paths are required'}), 400
#         model = VisionEncoderDecoderModel.from_pretrained("nlpconnect/vit-gpt2-image-captioning")
#         feature_extractor = ViTImageProcessor.from_pretrained("nlpconnect/vit-gpt2-image-captioning")
#         tokenizer = AutoTokenizer.from_pretrained("nlpconnect/vit-gpt2-image-captioning")

#         model.to(torch.device)
        
#         results = []
        
#         for image_path in image_paths:
#             try:
#                 if not os.path.exists(image_path):
#                     results.append({
#                         'image_path': image_path,
#                         'success': False,
#                         'error': 'Image file not found'
#                     })
#                     continue
                
#                 max_length = 16
#                 num_beams = 4
#                 gen_kwargs = {"max_length": max_length, "num_beams": num_beams}
                
#                 i_image = Image.open(image_path)
#                 if i_image.mode != "RGB":
#                     i_image = i_image.convert(mode="RGB")
                
#                 pixel_values = feature_extractor(images=[i_image], return_tensors="pt").pixel_values
#                 pixel_values = pixel_values.to(torch.device)
                
#                 output_ids = model.generate(pixel_values, **gen_kwargs)
                
#                 preds = tokenizer.batch_decode(output_ids, skip_special_tokens=True)
#                 caption = preds[0].strip()
                
#                 results.append({
#                     'image_path': image_path,
#                     'success': True,
#                     'caption': caption
#                 })
                
#             except Exception as e:
#                 results.append({
#                     'image_path': image_path,
#                     'success': False,
#                     'error': str(e)
#                 })
        
#         return jsonify({
#             'success': True,
#             'results': results
#         })
    
#     except Exception as e:
#         logging.exception("Error while captioning images")
#         return jsonify({'error': str(e)}), 500
