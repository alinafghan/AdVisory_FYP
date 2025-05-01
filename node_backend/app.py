import os
import logging
from flask import Flask, request, jsonify  # Flask-related imports
from flask_cors import CORS
from werkzeug.utils import secure_filename
import requests  #  For making HTTP requests
import pandas as pd # For working with data.
import numpy as np # For numerical computation
import xgboost as xgb # For using XGBoost
from gradio_client import Client # For using Gradio
from dotenv import load_dotenv # For loading environment variables.
import openai # For using OpenAI.
import torch # For PyTorch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, pipeline # For Hugging Face Transformers
import base64 # For encoding and decoding base64
from PIL import Image # For image processing
import io # For handling byte streams
import matplotlib.pyplot as plt # For plotting (if needed)
from audience_predictor import SmartAudiencePredictor # Import your custom audience predictor module

# Initialize Flask app
app = Flask(__name__)

openai.api_key = os.getenv("OPENAI_API_KEY")

# openai.api_key = os.getenv("OPENAI_API_KEY")

CORS(app)  #  Apply CORS to all routes
audience_predictor = SmartAudiencePredictor()

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


@app.route("/")
def home():
    return "Flask is running!"

######################### EDIT IMAGE #################################

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Configure upload folder for temporary image files
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/edit-image', methods=['POST'])
def edit_image():
    # Extract form data or JSON data
    prompt = request.form.get('prompt')
    model = request.form.get('model', 'gpt-image-1')  # Default to 'gpt-image-1' if not specified
    n = request.form.get('n', 1)  # Default to 1 if not specified
    quality = request.form.get('quality', 'auto')  # Default to 'auto' if not specified
    size = request.form.get('size', '1024x1024')  # Default to '1024x1024' if not specified
    
    api_key = os.environ.get('OPENAI_API_KEY') or request.form.get('api_key')
    if not api_key:
        return jsonify({"error": "API key is required"}), 400

    if not prompt:
        return jsonify({"error": "Prompt is required"}), 400

    if 'image' not in request.files:
        return jsonify({"error": "At least one image file is required"}), 400
    
    # Handle multiple image files for gpt-image-1
    image_files = request.files.getlist('image')
    if model == 'gpt-image-1' and len(image_files) > 16:
        return jsonify({"error": "Maximum 16 images allowed for gpt-image-1"}), 400
    elif model == 'dall-e-2' and len(image_files) > 1:
        return jsonify({"error": "Only one image allowed for dall-e-2"}), 400

    # Process mask if provided
    mask = None
    if 'mask' in request.files:
        mask_file = request.files['mask']
        if mask_file.filename:
            mask_filename = secure_filename(mask_file.filename)
            mask_path = os.path.join(app.config['UPLOAD_FOLDER'], mask_filename)
            mask_file.save(mask_path)
            mask = ('mask', (mask_filename, open(mask_path, 'rb'), 'image/png'))
    
    # Save images
    images = []
    for img_file in image_files:
        if img_file.filename:
            filename = secure_filename(img_file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            img_file.save(filepath)
            
            # For gpt-image-1, append images to a list
            images.append(('image[]', (filename, open(filepath, 'rb'), 'image/png')))
    
    # Prepare data
    data = {
        'prompt': prompt,
        'model': model,
        'n': int(n),
        'quality': quality,
        'size': size
    }
    
    # Prepare headers
    headers = {
        "Authorization": f"Bearer {api_key}"
    }
    
    try:
        # For dall-e-2 with single image
        if model == 'dall-e-2':
            files = [images[0]]  # Only one image for dall-e-2
            if mask:
                files.append(mask)
        # For gpt-image-1 with multiple images
        else:
            files = images  # All images for gpt-image-1
            if mask:
                files.append(mask)
        
        # Make request to OpenAI API
        response = requests.post(
            "https://api.openai.com/v1/images/edits",
            headers=headers,
            data=data,
            files=files
        )
        
        # Close all open file handles
        for file_tuple in files:
            try:
                file_tuple[1][1].close()
            except:
                pass
        
        # Get the base64 encoded image from the response
        if response.status_code == 200:
            response_json = response.json()
            image_base64 = response_json['data'][0]['b64_json']

            # Save the base64 image to your device
            image_data = base64.b64decode(image_base64)
            image_filename = "edited_image.png"  # You can customize the filename
            image_path = os.path.join(app.config['UPLOAD_FOLDER'], image_filename)
            with open(image_path, 'wb') as f:
                f.write(image_data)

            # Return response with the image URL for download
            return jsonify({
                'message': 'Image edited and saved successfully.',
                'imageBase64': image_base64,
                'saved_image_path': image_path
            }), 200
        
        return jsonify({"error": "Failed to generate image"}), 500
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# @app.route("/")
# def home():
#     return "Flask is running!"

######################### EDIT IMAGE #################################

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Configure upload folder for temporary image files
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


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


@app.route('/analyze', methods=['POST'])  # Make sure route is in app.py
def analyze_audience():  #  Make sure function is app.py
    try:
        data = request.get_json()
        image_data = data['image_data']

        # Extract the base64 data *without* the header
        header, encoded = image_data.split(",",
                                           1)  # Split the header from the base64 data
        image_bytes = base64.b64decode(encoded)
        image = Image.open(io.BytesIO(image_bytes))

        # Perform analysis using the SmartAudiencePredictor instance
        analysis_results = audience_predictor.generate_report(image)

        # Return a JSON response indicating success, including the analysis results
        return jsonify({
            'message': 'Image analysis successful',
            'analysis': analysis_results  # Include the analysis results in the response
        }), 200

    except Exception as e:
        error_message = f"Error analyzing audience: {str(e)}"
        print(error_message)  # Log the error for debugging
        return jsonify({'error': error_message}), 500
        
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)