##first do pip install flask and xgboost
import base64
import os
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS 
from transformers import pipeline  # ✅ This imports the pipeline function
import xgboost as xgb
import numpy as np
from flask_cors import CORS
import pandas as pd
from trends_analyzer import TrendAnalyzer  
import logging
from gradio_client import Client
from dotenv import load_dotenv
import openai
from rembg_helper import remove_background
from diffusers import DiffusionPipeline
from PIL import Image
import io
import torch
import replicate
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM



# Initialize Flask app
app = Flask(__name__)

CORS(app)  

# # Initialize the TrendAnalyzer
# analyzer = TrendAnalyzer()

# @app.route('/analyze', methods=['POST'])
# def analyze_trends():
#     try:
#         data = request.get_json()
#         keywords = data.get('keywords', [])
        
#         if not keywords:
#             return jsonify({'error': 'No keywords provided'}), 400
            
#         # Process pipeline
#         processed_data = analyzer.fetch_trend_data(keywords)
#         if not processed_data:
#             return jsonify({'error': 'Failed to fetch trend data'}), 500
            
#         models, forecasts = analyzer.train_prediction_models(processed_data)
#         if not forecasts:
#             return jsonify({'error': 'Failed to generate forecasts'}), 500
            
#         insights = analyzer.get_trend_insights(forecasts)
#         if not insights:
#             return jsonify({'error': 'Failed to generate insights'}), 500
            
#         recommendations = analyzer.generate_ad_recommendations(insights)
#         if not recommendations:
#             return jsonify({'error': 'Failed to generate recommendations'}), 500
            
#         return jsonify({
#             'insights': insights,
#             'recommendations': recommendations
#         })
        
#     except Exception as e:
#         logger.error(f"Error in analyze_trends: {str(e)}")
#         return jsonify({'error': str(e)}), 500

# @app.route('/predictions/<keyword>', methods=['GET'])
# def get_predictions(keyword):
#     try:
#         # Fetch trend data for single keyword
#         processed_data = analyzer.fetch_trend_data([keyword])
#         if not processed_data or keyword not in processed_data:
#             return jsonify({'error': f'No data available for {keyword}'}), 404
            
#         # Generate predictions
#         models, forecasts = analyzer.train_prediction_models({keyword: processed_data[keyword]})
#         if not forecasts or keyword not in forecasts:
#             return jsonify({'error': 'Failed to generate predictions'}), 500
            
#         # Extract prediction data
#         forecast_data = forecasts[keyword][['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(30)
#         prediction_data = forecast_data.to_dict(orient='records')
        
#         return jsonify({
#             'keyword': keyword,
#             'predictions': prediction_data
#         })
        
#     except Exception as e:
#         logger.error(f"Error in get_predictions: {str(e)}")
#         return jsonify({'error': str(e)}), 500
    
# @app.route('/search', methods=['POST'])
# def search_trends():
#     try:
#         data = request.get_json()
#         query = data.get('query', '').strip().lower()

#         if not query:
#             return jsonify({'error': 'Search query is required'}), 400

#         # Fetch all trends (or use cached data)
#         all_trends = fetch_all_trends()  # Replace with your logic to fetch all trends

#         # Filter trends based on the search query
#         filtered_trends = {
#             keyword: insight
#             for keyword, insight in all_trends.items()
#             if query in keyword.lower()
#         }

#         return jsonify({
#             'insights': filtered_trends,
#             'recommendations': []  # Add logic to filter recommendations if needed
#         })

#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

################################trends end###############################################

@app.route('/flux', methods=['POST'])
def flux():
    data = request.get_json()

    prompt = data.get('prompt')
    seed = data.get('seed')
    randomize_seed = data.get('randomize_seed')
    width = data.get('width') #576
    height = data.get('height') #1024
    num_inference_steps = data.get('num_inference_steps') #4

    flux_client = Client("black-forest-labs/FLUX.1-schnell")
    result = flux_client.predict(
		prompt=prompt,
        seed=0,
        randomize_seed=True,
        width=width,
        height=height,
        num_inference_steps=4,
        api_name="/infer")
    print(result)

    image_path = result[0]  
    if os.path.exists(image_path):
        with open(image_path, "rb") as f:
            encoded_image = base64.b64encode(f.read()).decode("utf-8")
        return jsonify({'Generated Image': encoded_image})
    else:
        return jsonify({'error': 'Image generation failed.'}), 500

##################### caption ##############################
load_dotenv()
@app.route('/generate-caption', methods=['POST'])
def generate_caption():
    try:
        data = request.get_json()
        print(data.keys())
        client = openai.OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        if not client.api_key:
            return jsonify({'error': 'API key is not set'}), 500

        content_list = []  # Prepare a list to hold the content

        if 'image_url' in data:
            image_input = {
                "type": "input_image",
                "image_url": data['image_url']
            }
            content_list.append({"type": "input_text", "text": "Write a caption for a social media post about this image. Make it engaging, include relevant hastags and emojis if it fits the vibe of the image and subject matter"})
            content_list.append(image_input)
        elif 'image_base64' in data:
            image_input = {
                "type": "input_image",
                "image_url": f"data:image/jpeg;base64,{data['image_base64']}"
            }
            content_list.append({"type": "input_text", "text": "Write a caption for a social media post about this image. Make it engaging, include relevant hastags and emojis if it fits the vibe of the image and subject matter"})
            content_list.append(image_input)


        elif 'text_prompt' in data:
            content_list.append({"type": "input_text", "text": data['text_prompt']})
            content_list.append({"type": "input_text", "text": "Write a caption for a social media post about this. Make it engaging, include relevant hashtags and emojis if it fits the vibe of the subject."})

        else:
            return jsonify({'error': 'No valid input provided'}), 400

        request_input = [{
            "role": "user",
            "content": content_list
        }]

        response = client.responses.create(
            model="gpt-4o", 
            input=request_input
        )

        caption = response.output_text

        return jsonify({'caption': caption})

    except Exception as e:
        return jsonify({'error': str(e)}), 500
openai_api_key = os.getenv("OPENAI_API_KEY")
if openai_api_key is None:
    raise ValueError("No API Key found. Please set the OPENAI_API_KEY in the .env file.")

######################### ENHANCE ################################

device = "cuda" if torch.cuda.is_available() else "cpu"
model_checkpoint = "gokaygokay/Flux-Prompt-Enhance"
tokenizer = AutoTokenizer.from_pretrained(model_checkpoint)
model = AutoModelForSeq2SeqLM.from_pretrained(model_checkpoint).to(device)

enhancer = pipeline('text2text-generation',
                    model=model,
                    tokenizer=tokenizer,
                    repetition_penalty=1.2,
                    device=device)

@app.route('/enhance', methods=['POST'])
def enhance_prompt():
    try:
        data = request.get_json()
        if 'prompt' not in data:
            return jsonify({'error': 'Invalid input. Expected JSON with "prompt" key.'}), 400
        
        prefix = "enhance prompt: "
        input_prompt = prefix + data['prompt']
        
        results = enhancer(input_prompt, max_length=256)
        enhanced_prompt = results[0]['generated_text']
        
        return jsonify({'enhanced_prompt': enhanced_prompt})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "up"}), 200




################################productad##########################################
api_token = os.getenv("API_TOKEN")
replicate_client = replicate.Client(api_token)
REPLICATE_MODEL_URL = "bytedance/sdxl-lightning-4step:6f7a773af6fc3e8de9d5a3c00be77c17308914bf67772726aff83496ba1e3bbe"
REPLICATE_MODEL = "daanelson/real-esrgan-a100:f94d7ed4a1f7e1ffed0d51e4089e4911609d5eeee5e874ef323d2c7562624bed"
@app.route('/generate', methods=['POST'])
def generate_image():
    # Get data from the frontend (prompt, width, height, etc.)
    data = request.get_json()

    # Define the input for the Replicate model
    input_data = {
        "prompt": data.get('prompt', ''),
        "negative_prompt": data.get('negative_prompt', ''),
        "width": data.get('width', 512),  # Default width
        "height": data.get('height', 512),  # Default height
        "num_inference_steps":4,
        "scheduler":'K_EULER_ANCESTRAL',
        "guidance_scale":0,
        "seed":0
        # You can add more params based on your needs
    }

    # Call Replicate API for SDXL Lightning model
    output = replicate_client.run(
        REPLICATE_MODEL_URL,
        input=input_data
    )

    # Handle the output if it's a list of file-like objects (binary data)
    if isinstance(output, list):
        image_urls = []
        for item in output:
            # Read the binary data from the file-like object
            image_data = item.read()

            # Convert the image data to a base64-encoded string
            image_base64 = base64.b64encode(image_data).decode('utf-8')

            # Add the base64 string to the list of images
            image_urls.append(image_base64)

        # Return the list of base64-encoded images
        return jsonify({'images': image_urls})

    # Return an error if the output format is unexpected
    return jsonify({'error': 'Unexpected output format'}), 500

def upscale_image_with_realesrgan(image_bytes):
    try:
        # Base64 encode the image bytes
        image_base64 = base64.b64encode(image_bytes).decode("utf-8")

        # Pass the base64-encoded string to the model
        input = {
            "image": f"data:image/png;base64,{image_base64}",
            "scale": 4,  # Adjust scale as needed
            "face_enhance": True
        }
        output_url = replicate_client.run(REPLICATE_MODEL, input=input)
        return output_url  # Output is a URL to the enhanced image
    except Exception as e:
        raise RuntimeError(f"Real-ESRGAN processing failed: {str(e)}")

def download_image(url):
    import requests
    response = requests.get(url)
    if response.status_code != 200:
        raise RuntimeError("Failed to download processed image")
    return response.content
    
@app.route('/remove-bg', methods=['POST'])
def remove_bg():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    image = request.files['image']
    image_bytes = image.read()

    try:
        # Step 1: Pass the image through Real-ESRGAN
        enhanced_image_url = upscale_image_with_realesrgan(image_bytes)

        # Step 2: Download the enhanced image from the output URL
        enhanced_image_bytes = download_image(enhanced_image_url)

        # Step 3: Remove the background from the enhanced image
        output_image_bytes = remove_background(enhanced_image_bytes)

        # Return the final image
        return send_file(
            io.BytesIO(output_image_bytes),
            mimetype='image/png',
            as_attachment=False,
            download_name='processed.png'
        )

    except Exception as e:
        return jsonify({'error': 'Failed to process image', 'details': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
